<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Middleware\EnsurePolice;
use App\Http\Middleware\EnsureEmailVerified;

use App\Http\Controllers\PoliceGen\PoliceNotificationController;



Route::middleware(['auth:sanctum', EnsurePolice::class, EnsureEmailVerified::class])->group(function () {
    Route::prefix('police/notifications')->name('police.notifications')->group(function () {
        Route::get(
            'setting', [PoliceNotificationController::class, 'notificationSetting']
            )->name('.setting');
        Route::patch(
            'update-setting', [PoliceNotificationController::class, 'updateNotificationSetting']
            )->name('.update-setting');


        Route::get(
            'all', [PoliceNotificationController::class, 'getAllNotifications']
            )->name('.all');
        Route::get(
            'unread', [PoliceNotificationController::class, 'getUnreadNotifications']
            )->name('.unread');
        Route::put(
            'mark-as-read', [PoliceNotificationController::class, 'markAsRead'] 
            )->name('.mark-as-read');
        Route::put(
            'mark-all-as-read', [PoliceNotificationController::class, 'markAllAsRead'] 
            )->name('.mark-all-as-read');
        Route::delete(
            'delete', [PoliceNotificationController::class, 'deleteNotification'] 
            )->name('.delete');
        Route::delete(
            'delete-all', [PoliceNotificationController::class, 'deleteAllNotifications'] 
            )->name('.delete-all');
        Route::get(
            'for-today', [PoliceNotificationController::class, 'notificationForToday'] 
            )->name('.for-today');
        Route::get(
            'past-seven-days', [PoliceNotificationController::class, 'notificationForPastSevenDaysExcludingToday'] 
            )->name('.past-seven-days');
    });
});