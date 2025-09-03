<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Middleware\EnsureDriver;
use App\Http\Middleware\EnsureEmailVerified;

use App\Http\Controllers\driver\FineManageController;
use App\Http\Controllers\driver\PaymentController;
use App\Http\Controllers\driver\FinePayingController;
use App\Http\Controllers\driver\FineAppealController;


Route::middleware(['auth:sanctum', EnsureDriver::class, EnsureEmailVerified::class])->group(function () {
    Route::get(
        'get-my-fines', [FineManageController::class, 'getAllFines']
        )->name('get-my-fines');
    Route::get(
        'get-all-unpaid-fines', [FineManageController::class, 'getAllUnpaidFines']
        )->name('get-all-unpaid-fines');
    Route::post(
        '/process-payment', [FinePayingController::class, 'processPayment']
        )->name('process-payment');

    Route::post(
        '/get-total-to-pay', [FinePayingController::class, 'getTotalToPay']
        )->name('get-total-to-pay');

    Route::get(
        '/get-recently-paid-fines', [FineManageController::class, 'getRecentlyPaidFines']
        )->name('get-recently-paid-fines');

    Route::post(
        '/appeal-fine', [FineAppealController::class, 'appealFine']
        )->name('appeal-fine');
});