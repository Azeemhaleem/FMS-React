<?php

namespace App\Http\Controllers\driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DriverNotificationController extends Controller
{
    public function notificationSetting(Request $request) {
        $driver = $request->user();

        return response()->json([
            'receives_email' => $driver->receives_email_notifications
        ], 200);
    }

    public function updateNotificationSetting(Request $request) {
        $validated = $request->validate([
            'receives_email' => 'bail|required|boolean',
        ]);
        $driver = $request->user();
        $driver->receives_email_notifications = $request->receives_email;
        $driver->save();
        return response()->json([
            'message' => 'Notification setting updated'
        ], 200);
    }

    public function getNotifications(Request $request)
    {
        $driver = $request->user();
        $notifications = $driver->notifications;
        return response()->json($notifications);
    }

    public function getUnreadNotifications(Request $request)
    {
        $driver = $request->user();
        $notifications = $driver->unreadNotifications;
        return response()->json($notifications);
    }

    public function markAsRead(Request $request)
    {
        $validated = $request->validate([
            'notification_id' => 'bail|required|string',
        ]);
        $driver = $request->user();
        $notification = $driver->notifications()->where('id', $request->notification_id)->firstOrFail();
        $notification->markAsRead();
        return response()->json([
            'message' => 'Notification id : ' . $notification->id . ' marked as read'
        ], 200);
    }

    public function markAllAsRead(Request $request)
    {
        $driver = $request->user();
        $driver->unreadNotifications->markAsRead();
        return response()->json([
            'message' => 'All notifications marked as read'
        ], 200);
    }

    public function deleteNotification(Request $request)
    {
        $validated = $request->validate([
            'notification_id' => 'bail|required|string',
        ]);
        $driver = $request->user();
        $notification = $driver->notifications()->where('id', $request->notification_id)->firstOrFail();
        $notification->delete();
        return response()->json([
            'message' => 'Notification id : ' . $notification->id . ' deleted'
        ], 200);
    }

    public function deleteAllNotifications(Request $request)
    {
        $driver = $request->user();
        $driver->notifications()->delete();
        return response()->json([
            'message' => 'All notifications deleted'
        ], 200);
    }

    public function notificationForToday(Request $request) {
        $driver = $request->user();
        $notifications = $driver->notifications()->whereDate('created_at', today())->get();
        return response()->json($notifications);
    }

    public function notificationForPastSevenDaysExcludingToday(Request $request) {
        $driver = $request->user();
        $notifications = $driver->notifications()->whereBetween('created_at', [now()->subDays(7), now()->subDay()])->get();
        return response()->json($notifications);
    }
}
