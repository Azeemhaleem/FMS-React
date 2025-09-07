<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripeController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        try {
            $checkout_session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price' => 'price_1NABCdEfGHijKLmNoPQRstu', // Replace with your price ID
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => env('FRONTEND_URL') . '/complete?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => env('FRONTEND_URL') . '/checkout',
            ]);

            return response()->json(['id' => $checkout_session->id]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getSessionStatus(Request $request)
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        try {
            $session = Session::retrieve($request->session_id);
            return response()->json([
                'status' => $session->status,
                'customer_email' => $session->customer_details->email ?? null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
