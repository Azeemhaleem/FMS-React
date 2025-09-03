<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\HigherPoliceRegistrationController;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Controllers\Auth\TrafficPoliceRegistrationController;
use App\Http\Middleware\EnsureEmailVerified;
use App\Http\Controllers\admin\ReassigningTrafficOfficerController;


Route::middleware(['auth:sanctum', EnsureAdmin::class, EnsureEmailVerified::class])->group(function () {
    Route::post(
        'admin/register-higher-police', [HigherPoliceRegistrationController::class, 'registerNewHigherPolice']
        )->name('admin.register-higher-police');
    Route::post(
        'admin/register-traffic-police', [TrafficPoliceRegistrationController::class, 'registerNewTrafficPolice']
        )->name('admin.register-traffic-police');
    Route::post(
        'admin/assign-traffic-police-to-higher-police', [TrafficPoliceRegistrationController::class, 'assignToHigherPolice']
        )->name('admin.assign-traffic-police-to-higher-police');

    Route::post(
        'admin/get-assigned-hOfficer', [ReassigningTrafficOfficerController::class, 'getTOfficerWithAssignedHOfficer']
    )->name('admin.get-assigned-hOfficer');

    Route::post(
        'admin/reassign-traffic-officer', [ReassigningTrafficOfficerController::class, 'reassignTrafficOfficer']
    )->name('admin.reassign-traffic-officer');
});