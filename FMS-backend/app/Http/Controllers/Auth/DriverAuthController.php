<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password as PasswordRules;

use App\Models\driverInDept;
use App\Services\ProfileImageService;
use App\Notifications\DriverEventNotification;
use Illuminate\Support\Facades\Storage;

use App\Models\DriverUser;
use Illuminate\Support\Facades\Hash;

class DriverAuthController extends Controller
{

public function login(Request $request) {
    $credentials = $request->validate([
        'username' => 'required',
        'password' => 'required'
    ]);

    // Try to find user by username first
    $user = DriverUser::where('username', $credentials['username'])->first();
    
    // If not found, try by email
    if (!$user) {
        $driverInDept = driverInDept::where('email', $credentials['username'])->first();
        if ($driverInDept) {
            $user = $driverInDept->driverUser;
        }
    }
    if (!$user) {
        return response()->json(['message' => 'Invalid username or password'], 401);
    }
    
    if (Hash::check($credentials['password'], $user->password)) {
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'message' => 'Successfully logged in',
            'token' => $token,
            'role' => 'driver'
        ]);
    }
    
    return response()->json(['message' => 'Invalid username or password'], 401);
}

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['messege' => 'Successfully logged out']);
    }

    public function logOutAll(Request $request) {
        $request->user()->tokens()->delete();
        return response()->json(['messege' => 'Successfully logged out from all devices']);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', 'confirmed', PasswordRules::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password does not match.'], 422); 
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();
        $user->notify(new DriverEventNotification(
            message: 'Your password was changed successfully.',
            type: 'profile.updated',
            meta: ['field' => 'password']
        ));
        return response()->json([
            'message' => 'Password changed successfully.'
        ], 200);

        
    }

    public function changerUsername(Request $request) {
        $validatedData = $request->validate([
            'username' => 'bail|required|string|max:50|unique:driver_users|unique:police_users',
        ]);

        $user = $request->user();
        $user->username = $validatedData['username'];
        $user->save();
        $user->notify(new DriverEventNotification(
        message: 'Your username was changed successfully.',
        type: 'profile.updated',
        meta: ['field' => 'username', 'new_username' => $validatedData['username']]
        ));
        return response()->json([
            'messege' => 'Username changed successfully'
        ], 200);
        

    }

    public function uploadProfileImage(Request $request) {
        $profileImageService = new ProfileImageService();
        return $profileImageService->uploadImage($request);
    }

    public function getProfileImage(Request $request) {
        $user = $request->user();
        return response()->json([
            'path' => Storage::url($user->profile_image_path)
        ], 200);
    }

    public function getUserNameEmail(Request $request) {
        $user = $request->user();
        $user_name = $user->username;
        $maskedEmail = maskEmail($user->getEmailForPasswordReset());
        return response()->json([
            'user_name' => $user_name,
            'email' => $maskedEmail
        ]);
    }

    public function getUserInfo(Request $request) {
        $user = $request->user();
        $driverInDept = $user->driverInDept;
        return response()->json([
            'full_name' => $driverInDept->full_name,
            'license_number' => $driverInDept->licence_id_no,
            'license_issued_date' => $driverInDept->license_issued_date,
            'license_expiry_date' => $driverInDept->license_expiry_date
        ]);
    }

    public function isEmailVerified(Request $request) {
        $user = $request->user();
        return response()->json([
            'is_email_verified' => $user->email_verified_at !== null
        ]);
    }
}
