<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Middleware\EnsureDriver;
use App\Http\Middleware\EnsureEmailVerified;

use App\Http\Controllers\driver\DriverNotificationController;



Route::middleware(['auth:sanctum', EnsureDriver::class, EnsureEmailVerified::class])->group(function () {
    Route::prefix('driver/notifications')->name('driver.notifications')->group(function () {
        Route::get(
            'setting', [DriverNotificationController::class, 'notificationSetting']
            )->name('.setting');
        Route::patch(
            'update-setting', [DriverNotificationController::class, 'updateNotificationSetting']
            )->name('.update-setting');


        Route::get(
            'all', [DriverNotificationController::class, 'getNotifications']
            )->name('.all');
        Route::get(
            'unread', [DriverNotificationController::class, 'getUnreadNotifications']
            )->name('.unread');
        Route::put(
            'mark-as-read', [DriverNotificationController::class, 'markAsRead'] 
            )->name('.mark-as-read');
        Route::put(
            'mark-all-as-read', [DriverNotificationController::class, 'markAllAsRead'] 
            )->name('.mark-all-as-read');
        Route::delete(
            'delete', [DriverNotificationController::class, 'deleteNotification'] 
            )->name('.delete');
        Route::delete(
            'delete-all', [DriverNotificationController::class, 'deleteAllNotifications'] 
            )->name('.delete-all');
        Route::get(
            'for-today', [DriverNotificationController::class, 'notificationForToday'] 
            )->name('.for-today');
        Route::get(
            'past-seven-days', [DriverNotificationController::class, 'notificationForPastSevenDaysExcludingToday'] 
            )->name('.past-seven-days');
    });
});