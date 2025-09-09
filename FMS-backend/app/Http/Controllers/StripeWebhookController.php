<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\ChargedFine;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    /**
     * Stripe sends events here. We verify signature, parse the event,
     * and mark fines as paid when a PaymentIntent succeeds.
     */
    public function handle(Request $request)
    {
        $payload        = $request->getContent(); // raw body for signature verification
        $sigHeader      = $request->header('Stripe-Signature');
        $endpointSecret = env('STRIPE_WEBHOOK_SECRET');

        if (!$endpointSecret) {
            Log::error('Stripe webhook secret not set.');
            return response('Server misconfigured', 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            // Invalid JSON
            Log::warning('Stripe webhook invalid payload: ' . $e->getMessage());
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            Log::warning('Stripe webhook invalid signature: ' . $e->getMessage());
            return response('Invalid signature', 400);
        }

        // ---- Handle events you care about ----
        switch ($event->type) {
            case 'payment_intent.succeeded': {
                /** @var \Stripe\PaymentIntent $pi */
                $pi = $event->data->object;

                // We set this metadata when creating PI in processPayment()
                $fineIdsCsv = $pi->metadata->fine_ids ?? '';
                $userIdMeta = $pi->metadata->user_id ?? null;

                $fineIds = array_filter(array_map('intval', explode(',', $fineIdsCsv)));

                if (empty($fineIds)) {
                    Log::warning("PI {$pi->id}: No fine_ids in metadata.");
                    break;
                }

                // Mark fines as paid. Use a transaction for safety.
                DB::transaction(function () use ($fineIds, $pi) {
                    ChargedFine::whereIn('id', $fineIds)
                        ->whereNull('paid_at')
                        ->update([
                            'paid_at'           => now(),
                            'payment_intent_id' => $pi->id,
                        ]);
                });

                Log::info("PI {$pi->id}: Marked fines paid", ['fine_ids' => $fineIds, 'amount' => $pi->amount_received]);
                break;
            }

            // (Optional) log other events for observability
            case 'payment_intent.payment_failed':
            case 'payment_intent.canceled':
            case 'payment_intent.processing':
            case 'charge.refunded':
            default:
                Log::info("Unhandled Stripe event: {$event->type}");
                break;
        }

        // Respond 200 so Stripe stops retrying
        return response('ok', 200);
    }
}
