<?php

namespace App\Http\Controllers\Auth\Driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRules;
use Illuminate\Auth\Events\PasswordReset;
use App\Models\DriverUser;

class DriverResetPasswordController extends Controller
{
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', PasswordRules::defaults()],
        ]);

        $status = Password::broker(config('auth.defaults.passwords'))->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) use ($request) {
                if (!$user instanceof DriverUser) {
                    \Log::warning("Password reset callback received unexpected user type.");
                    $driverInfo = \App\Models\driverInDept::where('email', request('email'))->first();
                    if ($driverInfo) {
                        $user = DriverUser::where('driver_in_dept_id', $driverInfo->id)->first();
                    }
                    if (!$user || !$user instanceof DriverUser) {
                        throw new \Exception("Could not find associated DriverUser for password reset.");
                    }
                }

                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();

                event(new PasswordReset($user));
            }
        );

        // return $status == Password::PASSWORD_RESET
        //             ? response()->json(['message' => __($status)], 200)
        //             : response()->json(['message' => __($status)], 400);
        if ($status == Password::PASSWORD_RESET) {
            $user = DriverUser::wherehas('driverInDept', function ($query) use ($request) {
                $query->where('email', $request->email);
            })->first();

            if ($user) {
                $user->tokens()->delete();
                $token = $user->createToken('auth_token')->plainTextToken;
                return response()->json([
                    'token' => $token,
                    'role' => 'driver'
                ], 200);
            } else {
                return response()->json(['message' => 'User not found'], 404);
            }
        } else {
            return response()->json(['message' => 'Password reset failed'], 400);
        }
    }
}