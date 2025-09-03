<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Middleware\EnsureHigherPolice;
use App\Http\Middleware\EnsureEmailVerified;

use App\Http\Controllers\hPolice\HPoliceDeleteFineController;
use App\Http\Controllers\hPolice\HPoliceAppealHandlingController;
use App\Http\Controllers\hPolice\ManageTPoliceServiceController;


Route::middleware(['auth:sanctum', EnsureHigherPolice::class, EnsureEmailVerified::class])->group(function () {
    Route::get(
        'h-police/get-all-fines-to-delete', [HPoliceDeleteFineController::class, 'getAllFinesToDelete']
        )->name('h-police.get-all-fines-to-delete');
    Route::delete(
        'h-police/accept-delete-fine-request', [HPoliceDeleteFineController::class, 'approveFineDeletion']
        )->name('h-police.accept-delete-fine-request');
    Route::delete(
        'h-police/decline-delete-fine-request', [HPoliceDeleteFineController::class, 'declineFineDeletion']
        )->name('h-police.decline-delete-fine-request');

    Route::get(
        'h-police/get-all-appeals', [HPoliceAppealHandlingController::class, 'getAllAppeals']
        )->name('h-police.get-all-appeals');
    Route::put(
        'h-police/accept-appeal', [HPoliceAppealHandlingController::class, 'acceptAppeal']
        )->name('h-police.accept-appeal');
    Route::put(
        'h-police/decline-appeal', [HPoliceAppealHandlingController::class, 'declineAppeal']
        )->name('h-police.decline-appeal');

    Route::get(
        'get-assigned-traffic-officers', [ManageTPoliceServiceController::class, 'getAllTrafficPolice']
        )->name('get-assigned-traffic-officers');
    Route::post(
        'get-traffic-officer-service-status', [ManageTPoliceServiceController::class, 'getTPoliceServiceStatusByPoliceUserId']
        )->name('get-traffic-officer-service-status');
    Route::put(
        'activate-traffic-officer', [ManageTPoliceServiceController::class, 'activateTPoliceOfficer']
        )->name('activate-traffic-officer');
    Route::put(
        'deactivate-traffic-officer', [ManageTPoliceServiceController::class, 'deactivateTPoliceOfficer']
        )->name('deactivate-traffic-officer');
});