<?php

namespace App\Http\Controllers\driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ChargedFine;
use App\Models\Fine;
use App\Models\DriverUser;
use App\Http\Controllers\driver\FineManageController;
use App\Services\PaymentService;

use Log;

class FinePayingController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function getTotalToPay(Request $request)
    {
        $request->validate([
            'fineIds' => 'required|array',
        ]);

        $finesResult = self::CheckIfUserHasToPayTheFine($request);

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

        $finesResult = self::CheckIfUserHasToPayTheFine($request);

        if ($finesResult instanceof \Illuminate\Http\JsonResponse) {
            return $finesResult;
        }

        $finesDriverReallyHasToPay = $finesResult;

        $totalAmount = 0;
        foreach ($finesDriverReallyHasToPay as $fine) {
            $fineType = Fine::where('id', $fine->fine_id)->first();
            $totalAmount += $fineType->amount;
        }
        $amountInCents = $totalAmount * 100;

        try {
            $paymentIntent = $this->paymentService->processPaymentIntent($amountInCents);

            if ($paymentIntent && $paymentIntent->status === 'succeeded') {
                foreach ($finesDriverReallyHasToPay as $fine) {
                    //do nothing for now
                }

                return response()->json([
                    'clientSecret' => $paymentIntent->client_secret
                ], 200);
            } else {
                return response()->json(['error' => 'Payment processing error'], 400);
            }

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe Payment Error during processPayment: ' . $e->getMessage());
            return response()->json(['error' => 'Payment processing error', 'message' => $e->getMessage()], 400);
        }
    }

    public function CheckIfUserHasToPayTheFine(Request $request) {
        $finesDriverHasToPay = ChargedFine::where('driver_user_id', $request->user()->id)->where('paid_at', null)->get();
    
        if ($finesDriverHasToPay->isEmpty()) {
            return response()->json([
                'message' => 'You don\'t have any fines to pay'
            ], 400);
        }
    
        $requestedFineIds = $request->fineIds ?? [];
        $validFineIds = $finesDriverHasToPay->pluck('id')->toArray(); // Get valid fine IDs from the Collection
    
        $finesDriverReallyHasToPay = collect(); // Initialize as an empty Collection
    
        foreach ($requestedFineIds as $requestedFineId) {
            if (in_array($requestedFineId, $validFineIds)) {
                $fineObject = $finesDriverHasToPay->firstWhere('id', $requestedFineId);
                if ($fineObject) {
                    $finesDriverReallyHasToPay->push($fineObject); // Push to the Collection
                }
            } else {
                return response()->json([
                    'message' => 'Invalid fine ID provided: ' . $requestedFineId
                ], 400);
            }
        }
    
        if ($finesDriverReallyHasToPay->isEmpty()) {
            return response()->json([
                'message' => 'No valid fine IDs provided from your unpaid fines.'
            ], 400);
        }
    
        return $finesDriverReallyHasToPay; // Now it returns a Collection
    }
}
