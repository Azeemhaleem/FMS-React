<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PoliceUser;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\EmailVerificationController;
use Illuminate\Validation\Rules\Password as PasswordRules;

use App\Models\driverInDept;
use App\Services\ProfileImageService;
use Illuminate\Support\Facades\Storage;

class PoliceAuthController extends Controller
{
    public function login(Request $request) {
        $request->validate([
            'login_credential' => 'required',
            'password' => 'required'
        ]);
    
        $loginCredential = $request->input('login_credential');
    
        $police = PoliceUser::where('username', $loginCredential)
                            ->orWhere('email', $loginCredential)
                            ->first();
    
        if ($police) {
            if (Hash::check($request->input('password'), $police->password)) {
                if (!$this->isEmailVerifiedprivate($police)) {
                    return response()->json([
                        'message' => 'Email is not verified',
                        'token' => $police->createToken('auth_token')->plainTextToken
                    ], 400);
                }
                $token = $police->createToken('auth_token')->plainTextToken;
                return response()->json([
                    'token' => $token,
                    'role' => $police->role_name
                ], 200);
            }
        }
    
        return response()->json(['message' => 'Invalid username or email or password'], 400);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['messege' => 'Successfully logged out']);
    }

    public function logOutAll(Request $request) {
        $request->user()->tokens()->delete();
        return response()->json(['messege' => 'Successfully logged out from all devices']);
    }

    private function isEmailVerifiedprivate(PoliceUser $police) {
        return $police->email_verified_at != null;
    }

    public function isEmailVerified(Request $request) {
        $user = $request->user();
        return response()->json([
            'isEmailVerified' => $this->isEmailVerifiedprivate($user)
        ], 200);
    }

    public function sendVerificationEmail(Request $request) {
        $user = $request->user();
        $email = $user->email;
        EmailVerificationController::sendVerificationEmail($user, $email);
        return response()->json([
            'messege' => 'Verification email sent'
        ], 200);
    }

    public function verifyEmail(Request $request) {
        return EmailVerificationController::verifyEmail($request);
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
        $maskedEmail = maskEmail($user->email);
        return response()->json([
            'user_name' => $user_name,
            'email' => $maskedEmail
        ]);
    }

   public function getUserInfo(Request $request) {
        $user = $request->user();

        // Make sure related models are available
        $user->loadMissing('role', 'admin', 'higherPolice', 'trafficPolice');

        // Use the accessor property, not a method:
        $policeInDept = $user->police_in_dept;

        return response()->json([
            'full_name' => $policeInDept?->full_name,
            'police_id' => $policeInDept?->police_id,
            'station'   => $user->station,     // will work after #2 below
            'role'      => $user->role_name,
        ]);
    }

}
