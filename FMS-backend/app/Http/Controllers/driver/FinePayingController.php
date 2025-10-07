<?php

namespace App\Http\Controllers\driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ChargedFine;
use App\Models\Fine;
use App\Models\DriverUser;
use App\Models\Payment;
use App\Http\Controllers\driver\FineManageController;
use App\Services\PaymentService;
use Stripe\StripeClient;
use Illuminate\Support\Facades\DB;

use Log;


// class FinePayingController extends Controller
// {
//     protected $paymentService;

//     public function __construct(PaymentService $paymentService)
//     {
//         $this->paymentService = $paymentService;
//     }

//     public function getTotalToPay(Request $request)
//     {
//         $request->validate([
//             'fineIds' => 'required|array',
//         ]);

//         $finesResult = self::CheckIfUserHasToPayTheFine($request);

//         if ($finesResult instanceof \Illuminate\Http\JsonResponse) {
//             return $finesResult;
//         }

//         $finesDriverReallyHasToPay = $finesResult;

//         $total = 0;
//         foreach ($finesDriverReallyHasToPay as $fine) {
//             $fineType = Fine::where('id', $fine->fine_id)->first();
//             if (!$fineType) {
//                 Log::error("Fine type not found for charged fine ID: " . $fine->id . ", fine_id: " . $fine->fine_id);
//                 return response()->json([
//                     'message' => 'Data error: Could not retrieve fine details.',
//                 ], 500);
//             }
//             $total += $fineType->amount;
//         }

//         return response()->json([
//             'total' => $total,
//             'fines' => $finesDriverReallyHasToPay,
//             'fineIds' => $finesDriverReallyHasToPay->pluck('id')->toArray()
//         ], 200);
//     }

//     public function processPayment(Request $request) {
//     $request->validate([
//         'fineIds' => 'required|array',
//     ]);

//     $finesResult = self::CheckIfUserHasToPayTheFine($request);

//     if ($finesResult instanceof \Illuminate\Http\JsonResponse) {
//         return $finesResult;
//     }

//     $finesDriverReallyHasToPay = $finesResult;

//     $totalAmount = 0;
//     foreach ($finesDriverReallyHasToPay as $fine) {
//         $fineType = Fine::where('id', $fine->fine_id)->first();
//         $totalAmount += $fineType->amount;
//     }
//     $amountInCents = $totalAmount * 100;

//     try {
//         // ✅ Create PaymentIntent
//         $paymentIntent = $this->paymentService->processPaymentIntent($amountInCents);

//         return response()->json([
//             'clientSecret' => $paymentIntent->client_secret,
//             'id' => $paymentIntent->id,
//             'amount' => $paymentIntent->amount,
//             'currency' => $paymentIntent->currency,
//             'status' => $paymentIntent->status,
//         ], 200);

//     } catch (\Stripe\Exception\ApiErrorException $e) {
//         Log::error('Stripe Payment Error during processPayment: ' . $e->getMessage());
//         return response()->json([
//             'error' => 'Payment processing error',
//             'message' => $e->getMessage()
//         ], 400);
//     }
// }

//     public function CheckIfUserHasToPayTheFine(Request $request) {
//         $finesDriverHasToPay = ChargedFine::where('driver_user_id', $request->user()->id)->where('paid_at', null)->get();
    
//         if ($finesDriverHasToPay->isEmpty()) {
//             return response()->json([
//                 'message' => 'You don\'t have any fines to pay'
//             ], 400);
//         }
    
//         $requestedFineIds = $request->fineIds ?? [];
//         $validFineIds = $finesDriverHasToPay->pluck('id')->toArray(); // Get valid fine IDs from the Collection
    
//         $finesDriverReallyHasToPay = collect(); // Initialize as an empty Collection
    
//         foreach ($requestedFineIds as $requestedFineId) {
//             if (in_array($requestedFineId, $validFineIds)) {
//                 $fineObject = $finesDriverHasToPay->firstWhere('id', $requestedFineId);
//                 if ($fineObject) {
//                     $finesDriverReallyHasToPay->push($fineObject); // Push to the Collection
//                 }
//             } else {
//                 return response()->json([
//                     'message' => 'Invalid fine ID provided: ' . $requestedFineId
//                 ], 400);
//             }
//         }
    
//         if ($finesDriverReallyHasToPay->isEmpty()) {
//             return response()->json([
//                 'message' => 'No valid fine IDs provided from your unpaid fines.'
//             ], 400);
//         }
    
//         return $finesDriverReallyHasToPay; // Now it returns a Collection
//     }
// }






class FinePayingController extends Controller
{
    protected $paymentService;
    protected $stripe;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function getTotalToPay(Request $request)
    {
        $request->validate([
            'fineIds' => 'required|array',
        ]);

        $finesResult = $this->CheckIfUserHasToPayTheFine($request);

        if ($finesResult instanceof \Illuminate\Http\JsonResponse) {
            return $finesResult;
        }

        $finesDriverReallyHasToPay = $finesResult;

        $total = 0;
        foreach ($finesDriverReallyHasToPay as $fine) {
            $fineType = Fine::where('id', $fine->fine_id)->first();
            if (!$fineType) {
                Log::error("Fine type not found for charged fine ID: " . $fine->id . ", fine_id: " . $fine->fine_id);
                return response()->json([
                    'message' => 'Data error: Could not retrieve fine details.',
                ], 500);
            }
            $total += $fineType->amount;
        }

        return response()->json([
            'total' => $total,
            'fines' => $finesDriverReallyHasToPay,
            'fineIds' => $finesDriverReallyHasToPay->pluck('id')->toArray()
        ], 200);
    }

    public function processPayment(Request $request) {
        $request->validate([
            'fineIds' => 'required|array',
        ]);

        $finesResult = $this->CheckIfUserHasToPayTheFine($request);

        if ($finesResult instanceof \Illuminate\Http\JsonResponse) {
            return $finesResult;
        }

        $finesDriverReallyHasToPay = $finesResult;

        $totalAmountLkr = 0;
        foreach ($finesDriverReallyHasToPay as $fine) {
            $fineType = Fine::where('id', $fine->fine_id)->first();
            $totalAmountLkr += (int) $fineType->amount;
        }
        $amountInCents = max(50, (int) round($totalAmountLkr * 100));

        try {
            $metadata = [
                'fine_ids' => implode(',', $finesDriverReallyHasToPay->pluck('id')->toArray()), // CHANGED
                'user_id'  => (string) $request->user()->id,                                     // CHANGED
            ];
            // ✅ Create PaymentIntent
            $paymentIntent = $this->paymentService->processPaymentIntent($amountInCents, $metadata);

            // Store payment in database
            DB::table('payments')->insert([
                'stripe_payment_intent_id' => $paymentIntent->id,
                'driver_user_id' => $request->user()->id,
                'charged_fine_ids' => json_encode($finesDriverReallyHasToPay->pluck('id')->toArray()),
                'amount' => $totalAmountLkr,
                'currency' => $paymentIntent->currency,
                'status' => $paymentIntent->status,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'id' => $paymentIntent->id,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
                'status' => $paymentIntent->status,
            ], 200);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe Payment Error during processPayment: ' . $e->getMessage());
            return response()->json([
                'error' => 'Payment processing error',
                'message' => $e->getMessage()
            ], 400);
        }

        
    }

    public function CheckIfUserHasToPayTheFine(Request $request)
{
    $finesDriverHasToPay = ChargedFine::where('driver_user_id', $request->user()->id)
        ->whereNull('paid_at')
        ->get();

    if ($finesDriverHasToPay->isEmpty()) {
        return response()->json(['message' => "You don't have any fines to pay"], 400);
    }

    $requestedFineIds = $request->fineIds ?? [];
    $validFineIds     = $finesDriverHasToPay->pluck('id')->toArray();

    $eligible = collect();
    $blocked  = []; // collect reasons for user feedback

    foreach ($requestedFineIds as $requestedId) {
        if (!in_array($requestedId, $validFineIds)) {
            return response()->json(['message' => 'Invalid fine ID provided: '.$requestedId], 400);
        }
        /** @var \App\Models\ChargedFine $fine */
        $fine = $finesDriverHasToPay->firstWhere('id', $requestedId);

        // ✅ block appealed / pending delete
        if (!empty($fine->appeal_requested) || !empty($fine->pending_delete)) {
            $blocked[] = [
                'id'       => $fine->id,
                'reason'   => 'Fine is under review',
                'deadline' => $fine->deadline_at_iso,
            ];
            continue;
        }

        // ✅ block if the 14-day window is closed
        if (!$fine->isPayable()) {
            $blocked[] = [
                'id'       => $fine->id,
                'reason'   => 'Payment window closed — court required',
                'deadline' => $fine->deadline_at_iso,
            ];
            continue;
        }

        $eligible->push($fine);
    }

    if ($eligible->isEmpty()) {
        return response()->json([
            'message' => 'No payable fines in your selection.',
            'blocked' => $blocked,
        ], 422); // Unprocessable Entity
    }

    // (Optional) return blocked as well so FE can warn for mixed selections
    if (!empty($blocked)) {
        // Not an error: allow paying what’s eligible.
        // The calling methods already just use what we return.
    }

    return $eligible;
}


    /**
     * Get payment intent details for verification
     */
    public function getPaymentIntent(Request $request, $paymentIntentId)
    {
        try {
            // Verify user authentication
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized'
                ], 401);
            }

            // Verify the user owns this payment intent
            $isOwner = $this->verifyPaymentIntentOwnership($paymentIntentId, $user->id);
            if (!$isOwner) {
                return response()->json([
                    'error' => 'Access denied'
                ], 403);
            }

            // Retrieve payment intent from Stripe
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

            return response()->json([
                'id' => $paymentIntent->id,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
                'status' => $paymentIntent->status,
                'client_secret' => $paymentIntent->client_secret,
                'created' => $paymentIntent->created,
                'payment_method' => $paymentIntent->payment_method,
                'confirmation_method' => $paymentIntent->confirmation_method
            ], 200);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe Error retrieving payment intent: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to retrieve payment details',
                'message' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            Log::error('Error retrieving payment intent: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to retrieve payment details'
            ], 500);
        }
    }

    /**
     * Update payment status after verification
     */
    public function updatePaymentStatus(Request $request)
    {
        $request->validate([
            'paymentIntentId' => 'required|string',
            'status' => 'required|string|in:succeeded,failed,processing,canceled'
        ]);

        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized'
                ], 401);
            }

            $paymentIntentId = $request->paymentIntentId;
            $status = $request->status;

            // Verify the user owns this payment intent
            $isOwner = $this->verifyPaymentIntentOwnership($paymentIntentId, $user->id);
            if (!$isOwner) {
                return response()->json([
                    'error' => 'Access denied'
                ], 403);
            }

            // Update payment status in database
            $updated = $this->updatePaymentInDatabase($paymentIntentId, $status, $user->id);

            if ($status === 'succeeded') {
                // Mark fines as paid
                $this->markFinesAsPaid($paymentIntentId, $user->id);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error updating payment status: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update payment status'
            ], 500);
        }
    }

    /**
     * Verify payment intent ownership
     */
    private function verifyPaymentIntentOwnership($paymentIntentId, $userId)
    {
        $payment = DB::table('payments')
                    ->where('stripe_payment_intent_id', $paymentIntentId)
                    ->where('driver_user_id', $userId) // Changed from user_id to driver_user_id
                    ->first();

        return $payment !== null;
    }

    /**
     * Update payment status in database
     */
    private function updatePaymentInDatabase($paymentIntentId, $status, $userId)
    {
        $updateData = [
            'status' => $status,
            'updated_at' => now()
        ];

        if ($status === 'succeeded') {
            $updateData['paid_at'] = now();
        }

        return DB::table('payments')
                ->where('stripe_payment_intent_id', $paymentIntentId)
                ->where('driver_user_id', $userId) // Changed from user_id to driver_user_id
                ->update($updateData);
    }

    /**
     * Mark fines as paid when payment is successful
     */
    private function markFinesAsPaid($paymentIntentId, $userId)
    {
        try {
            // Get the payment record to find associated fines
            $payment = DB::table('payments')
                        ->where('stripe_payment_intent_id', $paymentIntentId)
                        ->where('driver_user_id', $userId) // Changed from user_id to driver_user_id
                        ->first();

            if ($payment && isset($payment->charged_fine_ids)) { // Changed from fine_ids to charged_fine_ids
                $fineIds = json_decode($payment->charged_fine_ids, true); // Changed from fine_ids to charged_fine_ids
                
                // Update charged fines as paid
                ChargedFine::whereIn('id', $fineIds)
                          ->where('driver_user_id', $userId)
                          ->update([
                              'paid_at' => now(),
                              'updated_at' => now()
                          ]);

                Log::info("Marked fines as paid: " . implode(', ', $fineIds) . " for user: " . $userId);
            }
        } catch (\Exception $e) {
            Log::error('Error marking fines as paid: ' . $e->getMessage());
        }
    }

    /**
     * Get payment details with fine information
     */
    public function getPaymentDetails(Request $request, $paymentIntentId)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized'
                ], 401);
            }

            // Verify the user owns this payment intent
            $isOwner = $this->verifyPaymentIntentOwnership($paymentIntentId, $user->id);
            if (!$isOwner) {
                return response()->json([
                    'error' => 'Access denied'
                ], 403);
            }

            // Get payment record from database
            $payment = DB::table('payments')
                        ->where('stripe_payment_intent_id', $paymentIntentId)
                        ->where('driver_user_id', $user->id) // Changed from user_id to driver_user_id
                        ->first();

            if (!$payment) {
                return response()->json([
                    'error' => 'Payment not found'
                ], 404);
            }

            // Get fine details
            $fineIds = json_decode($payment->charged_fine_ids, true); // Changed from fine_ids to charged_fine_ids
            $fines = ChargedFine::with('fine')
                        ->whereIn('id', $fineIds)
                        ->where('driver_user_id', $user->id)
                        ->get();

            // Get payment intent from Stripe for latest status
            $stripePaymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

            return response()->json([
                'paymentIntentId' => $paymentIntentId,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => $stripePaymentIntent->status,
                'created' => $payment->created_at,
                'fines' => $fines->map(function($chargedFine) {
                    return [
                        'id' => $chargedFine->id,
                        'amount' => $chargedFine->fine->amount,
                        'description' => $chargedFine->fine->description,
                        'violation_date' => $chargedFine->issued_at // Changed from violation_date to issued_at
                    ];
                }),
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ], 200);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe Error retrieving payment details: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to retrieve payment details'
            ], 400);
        } catch (\Exception $e) {
            Log::error('Error retrieving payment details: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to retrieve payment details'
            ], 500);
        }
    }
}