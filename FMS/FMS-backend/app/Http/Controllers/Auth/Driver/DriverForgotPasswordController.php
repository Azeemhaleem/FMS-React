<?php

namespace App\Http\Controllers\Auth\Driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use App\Models\driverInDept;

class DriverForgotPasswordController extends Controller
{
    public function sendResetLinkEmail(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|max:255']);

        $driverInfo = driverInDept::where('email', $request->email)->first();

        if (!$driverInfo) {
             return response()->json(['message' => __('We have emailed your password reset link!')], 200);
        }

        $user = $driverInfo->driverUser()->first();

        if (!$user) {
             return response()->json(['message' => __('We have emailed your password reset link!')], 200);
        }

        try {
            $token = Password::broker(config('auth.defaults.passwords'))->createToken($user);
            $user->sendPasswordResetNotification($token);
            return response()->json(['message' => __('We have emailed your password reset link!')], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send reset link.'], 500);
        }
         
    }
}
