<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AdminRegistrationController;
use App\Http\Middleware\EnsureAnyAdmin;
use App\Http\Middleware\EnsureEmailVerified;

Route::middleware(['auth:sanctum', EnsureAnyAdmin::class, EnsureEmailVerified::class])->group(function () {
    Route::post(
        'check-police-exists', [AdminRegistrationController::class, 'checkPoliceHasAccountWrapped']
    )->name('check-police-exists');
});