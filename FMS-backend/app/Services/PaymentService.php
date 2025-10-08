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

    public function processPaymentIntent(int $amount, array $metadata = [], string $currency = 'lkr')
    {
        try {
            $paymentIntent = $this->stripeClient->paymentIntents->create([
                'amount' => $amount,
                'currency' => strtolower($currency),
                'automatic_payment_methods' => ['enabled' => true],
                'metadata' => $metadata,
                //'payment_method' => 'pm_card_visa',
                //'confirmation_method' => 'automatic',
                //'confirm' => true,
            ]);

                return $paymentIntent;

        } catch (ApiErrorException $e) {
            Log::error('Stripe Payment Error: ' . $e->getMessage());
            throw $e;
        }
    }
}




// class PaymentService
// {
//     protected StripeClient $stripe;

//     public function __construct()
//     {
//         // reads STRIPE_SECRET from config/services.php or .env
//         $this->stripe = new StripeClient(config('services.stripe.secret', env('STRIPE_SECRET')));
//     }

//     /**
//      * Create a PaymentIntent and return it.
//      *
//      * @param int   $amountInCents    Amount in the smallest currency unit.
//      * @param array $options          [
//      *   'currency'        => 'usd',
//      *   'metadata'        => ['key' => 'value'],
//      *   'idempotency_key' => 'string',
//      *   // optionally: 'payment_method_types' => ['card']
//      * ]
//      *
//      * @return \Stripe\PaymentIntent
//      * @throws \Stripe\Exception\ApiErrorException
//      */
//     public function processPaymentIntent(int $amountInCents, array $options = [])
//     {
//         $currency = strtolower($options['currency'] ?? 'usd'); // Stripe expects lowercase
//         $metadata = $options['metadata'] ?? [];

//         // Prefer automatic payment methods; lets Stripe handle suitable methods (incl. 3DS)
//         $params = [
//             'amount'                     => $amountInCents,
//             'currency'                   => $currency,
//             'metadata'                   => $metadata,
//             'automatic_payment_methods'  => ['enabled' => true],
//             // DO NOT confirm here; let the client confirm with the client_secret
//             // 'confirm' => false,
//         ];

//         // If you want to restrict to cards only, uncomment next line and remove automatic_payment_methods
//         // $params['payment_method_types'] = $options['payment_method_types'] ?? ['card'];

//         $requestOpts = [];
//         if (!empty($options['idempotency_key'])) {
//             $requestOpts['idempotency_key'] = $options['idempotency_key'];
//         }

//         // Create a new PaymentIntent; return it (status will be e.g. "requires_payment_method")
//         return $this->stripe->paymentIntents->create($params, $requestOpts);
//     }
// }
