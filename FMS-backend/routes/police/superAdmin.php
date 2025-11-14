<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AdminRegistrationController;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureEmailVerified;
use App\Http\Controllers\sAdmin\AccountCreationLogController;
use App\Http\Controllers\sAdmin\ManageFinesController;
use App\Http\Controllers\sAdmin\ChargedFineDetailsController;
use App\Http\Controllers\sAdmin\DriverDetailsController;
use App\Http\Controllers\sAdmin\PoliceDetailsController;
use App\Http\Controllers\sAdmin\PdfGenerateController;
use App\Http\Controllers\sAdmin\AdminOverviewController;


Route::middleware(['auth:sanctum', EnsureSuperAdmin::class, EnsureEmailVerified::class])->group(function () {
    Route::post(
        'super-admin/register-admin', [AdminRegistrationController::class, 'registerNewAdmin']
        )->name('super-admin.register-admin');
    Route::get(
        'get-logs/account-creation/all', [AccountCreationLogController::class, 'getAllAccountCreationLogs']
        )->name('get-logs.account-creation.all');
    Route::get(
        'get-logs/account-creation/created-by/{police_id}', [AccountCreationLogController::class, 'getAccountCreationLogsCreatedBy']
        )->name('get-logs.account-creation.created-by');
    Route::get(
        'get-logs/account-creation/created-for/{police_id}', [AccountCreationLogController::class, 'getAccountCreationLogsCreatedFor']
        )->name('get-logs.account-creation.created-for');

    Route::post(
        'add-fine', [ManageFinesController::class, 'addFinesToTable']
        )->name('add-fine');
    Route::post(
        'update-fine', [ManageFinesController::class, 'updateFine']
        )->name('update-fine');
    Route::post(
        'delete-fine', [ManageFinesController::class, 'deleteFine']
        )->name('delete-fine');
    Route::get(
        'get-fine-by-id/{fine_id}', [ManageFinesController::class, 'getFineById']
        )->name('get-fine-by-id');
    Route::get(
        's-admin/get-all-fines', [ManageFinesController::class, 'getAllFines']
        )->name('s-admin.get-all-fines');

    Route::post(
        'get-charged-fines/traffic-police/by-police-id', [ChargedFineDetailsController::class, 'chargedFinesBySpecificTrafficPoliceByPoliceId']
        )->name('get-charged-fines.traffic-police.by-police-id');
    Route::post(
        'get-traffic-police-id/by-charged-fine-id', [ChargedFineDetailsController::class, 'findTrafficPoliceByChargedFineId']
        )->name('get-traffic-police-id.by-charged-fine-id');

    Route::post(
        'get-driver/by-license-number', [DriverDetailsController::class, 'getDriverDetailsByLicenseNumber']
        )->name('get-driver.by-license-number');
    
    Route::post(
        'get-police/by-police-id', [PoliceDetailsController::class, 'getPoliceDetailsByPoliceId']
        )->name('get-police.by-police-id');

    Route::get(
        's-admin/generate-pdf', [PdfGenerateController::class, 'generatePDF']
        )->name('s-admin.generate-pdf');
    Route::get(
        's-admin/overview', [AdminOverviewController::class, 'overview'])
        ->name('s-admin.overview');
});