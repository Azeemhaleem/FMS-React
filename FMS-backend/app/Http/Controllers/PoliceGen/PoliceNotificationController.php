<?php

namespace App\Http\Controllers\PoliceGen;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache; 

class PoliceNotificationController extends Controller
{
    public function notificationSetting(Request $request) {
        $police = $request->user();

        return response()->json([
            'receives_email' => $police->receives_email_notifications
        ], 200);
    }

    public function updateNotificationSetting(Request $request) {
        $validated = $request->validate([
            'receives_email' => 'bail|required|boolean',
        ]);
        $police = $request->user();
        $police->receives_email_notifications = $request->receives_email;
        $police->save();
        return response()->json([
            'message' => 'Notification setting updated'
        ], 200);
    }

    public function getAllNotifications(Request $request) {
        $police = $request->user();
        $notifications = $police->notifications()->get();
        return response()->json($notifications);
    }

    public function getUnreadNotifications(Request $request) {
        $police = $request->user();
        $notifications = $police->unreadNotifications()->get();
        return response()->json($notifications);
    }
    public function unreadCount(Request $request)
    {
        $police = $request->user();

        $count = Cache::remember("police:unread_count:{$police->id}", 10, function () use ($police) {
            return $police->unreadNotifications()->count();
        });

        return response()->json(['count' => $count], 200);
    }

    public function markAsRead(Request $request) {
        $validated = $request->validate([
            'notification_id' => 'bail|required|string',
        ]);
        $police = $request->user();
        $notification = $police->notifications()->where('id', $request->notification_id)->firstOrFail();
        $notification->markAsRead();
        Cache::forget("police:unread_count:{$police->id}");
        return response()->json([
            'message' => 'Notification id : ' . $notification->id . ' marked as read'
        ], 200);
    }

    public function markAllAsRead(Request $request) {
        $police = $request->user();
        $police->unreadNotifications()->get()->markAsRead();
        return response()->json([
            'message' => 'All notifications marked as read'
        ], 200);
    }

    public function deleteNotification(Request $request) {
        $validated = $request->validate([
            'notification_id' => 'bail|required|string',
        ]);
        $police = $request->user();
        $notification = $police->notifications()->where('id', $request->notification_id)->firstOrFail();
        $notification->delete();
        Cache::forget("police:unread_count:{$police->id}");
        return response()->json([
            'message' => 'Notification id : ' . $notification->id . ' deleted'
        ], 200);
    }

    public function deleteAllNotifications(Request $request) {
        $police = $request->user();
        $police->notifications()->delete();
        Cache::forget("police:unread_count:{$police->id}");
        return response()->json([
            'message' => 'All notifications deleted'
        ], 200);
    }

    public function notificationForToday(Request $request) {
        $police = $request->user();
        $notifications = $police->notifications()->whereDate('created_at', today())->get();
        return response()->json($notifications);
    }

    public function notificationForPastSevenDaysExcludingToday(Request $request) {
        $police = $request->user();
        $notifications = $police->notifications()->whereBetween('created_at', [now()->subDays(7), now()->subDay()])->get();
        return response()->json($notifications);
    }
}
