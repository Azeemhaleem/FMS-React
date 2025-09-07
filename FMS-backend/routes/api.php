<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StripeController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


require base_path('routes/driver/driverAuth.php');
require base_path('routes/police/policeAuth.php');


Route::post('/stripe/create-checkout-session', [StripeController::class, 'createCheckoutSession']);
Route::post('/stripe/session-status', [StripeController::class, 'getSessionStatus']);
