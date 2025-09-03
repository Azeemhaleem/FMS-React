<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\PoliceAuthController;
use App\Http\Controllers\Auth\Police\ForgotPasswordController;
use App\Http\Controllers\Auth\Police\ResetPasswordController;

use App\Http\Middleware\EnsurePolice;

use App\Http\Controllers\PoliceGen\PoliceDeleteAccountController;


Route::post('police/login', [PoliceAuthController::class, 'login'])
    ->name('police.login');
    // ->middleware('throttle:3,1');

Route::prefix('police/password')->name('police.password')->group(function () {
    Route::post('/forgot', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('police.password.forgot');
    Route::post('/reset', [ResetPasswordController::class, 'reset'])->name('police.password.reset');
    Route::post('/update', [PoliceAuthController::class, 'changePassword'])->name('police.password.update')
        ->middleware(['auth:sanctum', EnsurePolice::class]);
});

Route::post('police/changer-username', [PoliceAuthController::class, 'changerUsername'])
        ->name('police.changer-username')
        ->middleware(['auth:sanctum', EnsurePolice::class]);

Route::middleware(['auth:sanctum', EnsurePolice::class])->group(function () {
    Route::post('police/logout', [PoliceAuthController::class, 'logout'])->name('police.logout');
    Route::post('police/logout-all', [PoliceAuthController::class, 'logOutAll'])->name('police.logout-all');
    Route::get('police/is-email-verified', [PoliceAuthController::class, 'isEmailVerified'])->name('police.is-email-verified');
    Route::get(
        'police/send-verification-email', [PoliceAuthController::class, 'sendVerificationEmail']
        )->name('police.send-verification-email');
    Route::post(
        'police/verify-email', [PoliceAuthController::class, 'verifyEmail']
        )->name('police.verify-email');

    Route::delete('/police/delete-account', [PoliceDeleteAccountController::class, 'deleteAccount'])->name('police.delete-account');

    Route::post('/police/upload-profile-image', [PoliceAuthController::class, 'uploadProfileImage'])->name('police.upload-profile-image');
    Route::get('/police/get-profile-image', [PoliceAuthController::class, 'getProfileImage'])->name('police.get-profile-image');

    Route::get('police/get-username-email', [PoliceAuthController::class, 'getUserNameEmail'])->name('police.get-username-email');

    Route::get('police/get-user-info', [PoliceAuthController::class, 'getUserInfo'])->name('police.get-user-info');
});

require base_path('routes/police/superAdmin.php');
require base_path('routes/police/admin.php');
require base_path('routes/police/allAdmin.php');
require base_path('routes/police/trafficPolice.php');
require base_path('routes/police/higherPolice.php');
require base_path('routes/police/policeNotif.php');