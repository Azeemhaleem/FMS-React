<?php

namespace App\Services;

use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    protected $stripeClient;

    public function __construct()
    {
        $this->stripeClient = new StripeClient(config('services.stripe.secret'));
    }

    public function processPaymentIntent(int $amount)
    {
        try {
            $paymentIntent = $this->stripeClient->paymentIntents->create([
                'amount' => $amount,
                'currency' => 'USD',
                'payment_method_types' => ['card'],
                'payment_method' => 'pm_card_visa',
                'confirmation_method' => 'manual',
                'confirm' => true,
            ]);

            if ($paymentIntent->status === 'succeeded') {
                return $paymentIntent;
            } else {
                Log::warning('Stripe Payment Intent Failed: Status - ' . $paymentIntent->status);
                return false;
            }

        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Error: ' . $e->getMessage());
            throw $e;
        }
    }
}