<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Middleware\EnsureUuidIsValid;
use App\Http\Controllers\Auth\RegistrationController;
use App\Http\Controllers\Auth\DriverAuthController;
use App\Http\Controllers\Auth\Driver\DriverForgotPasswordController;
use App\Http\Controllers\Auth\Driver\DriverResetPasswordController;
use App\Http\Controllers\driver\DriverDeleteAccountController;

use App\Http\Middleware\EnsureDriver;


// Route::post('/check-license-number', [RegistrationController::class, 'checkLicenseNumber'])->name('check-license-number');

Route::post(
    '/register-driver', [RegistrationController::class, 'registerDriver']
    )->name('register-driver');

Route::post('/driver/forgot-password', [DriverForgotPasswordController::class, 'sendResetLinkEmail'])
    ->middleware('guest')
    ->name('driver.forgot-password');

Route::post('/driver/reset-password', [DriverResetPasswordController::class, 'resetPassword'])
    ->middleware('guest')
    ->name('driver.reset-password');

Route::post('/login', [DriverAuthController::class, 'login'])->name('login');
// Route::post('/login', [DriverAuthController::class, 'login'])->name('login')->middleware('throttle:3,1');
Route::post('/logout', [DriverAuthController::class, 'logout'])->name('logout')->middleware('auth:sanctum');
Route::post('/logout-all', [DriverAuthController::class, 'logOutAll'])->name('logout-all')->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', EnsureDriver::class])->group(function () {
    Route::get(
        '/send-verification-email', [RegistrationController::class, 'sendVerificationEmail']
        )->name('send-verification-email');
    Route::post(
        '/verify-email', [RegistrationController::class, 'verifyEmail']
        )->name('verify-email');

    Route::post('/driver/change-password', [DriverAuthController::class, 'changePassword'])->name('driver.change-password');
    Route::post('/driver/changer-username', [DriverAuthController::class, 'changerUsername'])->name('driver.changer-username');

    Route::delete('/driver/delete-account', [DriverDeleteAccountController::class, 'deleteAccount'])->name('driver.delete-account');

    Route::post('/driver/upload-profile-image', [DriverAuthController::class, 'uploadProfileImage'])->name('driver.upload-profile-image');
    Route::get('/driver/get-profile-image', [DriverAuthController::class, 'getProfileImage'])->name('driver.get-profile-image');

    Route::get('/driver/get-user-name-email', [DriverAuthController::class, 'getUserNameEmail'])->name('driver.get-user-name-email');
    Route::get('/driver/get-user-info', [DriverAuthController::class, 'getUserInfo'])->name('driver.get-user-info');

    Route::get(
        'driver/check-email-verified', [DriverAuthController::class, 'isEmailVerified']
    )->name('driver.check-email-verified');
});

require base_path('routes/driver/fines.php');
require base_path('routes/driver/driverNotif.php');