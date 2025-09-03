<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EmailVerificationToken;
use App\Models\PoliceUser;
use App\Models\DriverUser;
use App\Http\Controllers\EmailSendingController;

use Illuminate\Support\Facades\Mail;

class EmailVerificationController extends Controller
{
    public static function sendVerificationEmail($user, $email) {
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        EmailVerificationToken::create([
            'token' => $code,
            'username' => $user->username,
        ]);
        $subject = 'Verify your email';
        $message = "Email verification code: $code";
        EmailSendingController::sendEmail($email, $subject, $message);
        return response()->json([
            'messege' => 'Verification email sent'
        ], 200);
    }

    public static function verifyEmail(Request $request) {
        $token = $request->token;
        $emailVerificationToken = EmailVerificationToken::where('token', $token)->first();
        if (!$emailVerificationToken) {
            return response()->json([
                'messege' => 'Invalid token'
            ], 400);
        }
        $user = PoliceUser::where('username', $emailVerificationToken->username)->first();
        if (!$user) {
            $user = DriverUser::where('username', $emailVerificationToken->username)->first();
        }
        if (!$user) {
            return response()->json([
                'messege' => 'Invalid token'
            ], 400);
        }
        EmailVerificationToken::where('token', $token)->delete();
        $user->email_verified_at = now();
        $user->save();
        return response()->json([
            'messege' => 'Email verified'
        ], 200);
    }
}
