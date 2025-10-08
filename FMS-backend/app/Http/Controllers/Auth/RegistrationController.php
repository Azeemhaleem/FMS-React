<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\driverInDept;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\tempDriver;
use App\Models\DriverUser;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\EmailVerificationController;


class RegistrationController extends Controller
{
    public function registerDriver(Request $request): JsonResponse {
        $messege = $request->validate([
            'username' => 'bail|required|max:50|unique:driver_users|unique:police_users',
            'password' => 'required|max:50|confirmed',
            'license_number' => 'required|max:50|exists:driver_in_depts,license_no'
        ]);
        $driverInDept = driverInDept::where('license_no', $messege['license_number'])->first();
        $driverUser = DriverUser::create([
            'driver_in_dept_id' => $driverInDept->id,
            'username' => $messege['username'],
            'password' => Hash::make($messege['password'])
        ]);
        $token = $driverUser->createToken('auth_token')->plainTextToken;
        return response()->json([
            'messege' => 'Successfully registered',
            'token' => $token,
            'role' => 'driver'
        ], 200);
    }

    public function verifyEmail(Request $request) {
        return EmailVerificationController::verifyEmail($request);
    }

    public function sendVerificationEmail(Request $request) {
        $user = $request->user();
        $email = driverInDept::getEmailbyId($user->driver_in_dept_id);
        EmailVerificationController::sendVerificationEmail($user, $email);
        return response()->json([
            'messege' => 'Verification email sent'
        ], 200);
    }
}