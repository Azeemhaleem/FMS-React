<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Middleware\EnsureTrafficPolice;
use App\Http\Middleware\EnsureEmailVerified;
use App\Http\Controllers\tPolice\ChargeFineController;
use App\Http\Controllers\tPolice\DeleteFineController;
use App\Http\Controllers\hPolice\ManageTPoliceServiceController;
use App\Http\Middleware\EnsureTPoliceIsInService;
use App\Http\Controllers\tPolice\GetChargedFinesController;


Route::middleware(['auth:sanctum', EnsureTrafficPolice::class, EnsureEmailVerified::class])->group(function () {
    Route::get(
        'get-all-fines', [ChargeFineController::class, 'getAllFines']
        )->name('get-all-fines');    
    Route::post(
        'charge-fine', [ChargeFineController::class, 'chargeFine']
        )->name('charge-fine')
        ->middleware(EnsureTPoliceIsInService::class);
    Route::post(
        'check-license-number', [ChargeFineController::class, 'checkLicenseNumber']
        )->name('check-license-number');

    Route::get(
        'getLastFine', [ChargeFineController::class, 'getLastFine']
        )->name('getLastFine');

    Route::delete(
        'delete-fine-request', [DeleteFineController::class, 'deleteFineRequest']
        )->name('delete-fine-request')
        ->middleware(EnsureTPoliceIsInService::class);

    Route::get(
        'tpolice/get-service-status', [ManageTPoliceServiceController::class, 'getTPoliceServiceStatus']
        )->name('tpolice.get-service-status');

    Route::get(
        'tpolice/get-charged-fines-in-last-seven-days', [GetChargedFinesController::class, 'getChargedFinesInLastSevenDays']
        )->name('tpolice.get-charged-fines-in-last-seven-days');
});