<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Admin;
use App\Models\HigherPolice;
use App\Models\PoliceInDept;
use App\Models\TrafficPolice;
use App\Models\PoliceUser;
use Illuminate\Support\Facades\Hash;
use App\Models\Roles;
use App\Models\AccountCreationLog;

class AdminRegistrationController extends Controller
{
    public function registerNewAdmin(Request $request) {
        $request->validate([
            'police_id' => 'bail|required',
            'username' => 'bail|required|string|unique:driver_users|unique:police_users',
            'email' => 'bail|required|string|email|unique:police_users',
            'password' => 'required|string|confirmed',
        ]);
        
        $messege = self::registerNewPolice($request);
        if ($messege !== true) {
            return response()->json([
                'messege' => $messege
            ], 400);
        }
        $policeInDept = PoliceInDept::where('police_id', $request->police_id)->first();
        $user = PoliceUser::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => Roles::where('name', 'admin')->first()->id,
        ]);
        $admin = Admin::create([
            'police_in_dept_id' => $policeInDept->id,
            'police_user_id' => $user->id
        ]);
        self::logAccountCreation($request->user(), $user);
        return response()->json([
            'messege' => 'Admin created successfully',
            'user' => $user
        ], 201);
    }

    private static function checkPoliceHasAccount($police_id) {
        $policeInDept = PoliceInDept::where('police_id', $police_id)->first();
        $policeUser = $policeInDept->policeUser;
        if ($policeUser) {
            return true;
        }
        return false;
    }

    public function checkPoliceHasAccountWrapped(Request $request) {
        $request->validate([
            'police_id' => 'bail|required'
        ]);
        $returnRespons = self::checkPoliceHasAccount($request->police_id);
        if ($returnRespons) {
            return response()->json([
                'messege' => 'Police already has an account'
            ], 400);
        } else {
            return response()->json([
                'messege' => 'Police does not have an account'
            ], 200);
        }
    }

    public static function registerNewPolice(Request $request) {
        $request->validate([
            'police_id' => 'bail|required',
            'username' => 'bail|required|string|unique:driver_users|unique:police_users',
            'email' => 'bail|required|string|email|unique:police_users',
            'password' => 'required|string|confirmed',
        ]);
        $policeInDept = PoliceInDept::where('police_id', $request->police_id)->first();
        if (!$policeInDept) {
            return 'Invalid police id';
        }
        if (self::checkPoliceHasAccount($request->police_id)) {
            return 'Police already has an account';
        }
        return true;
    }

    public static function logAccountCreation(PoliceUser $createdUser, PoliceUser $createdFor) {
        AccountCreationLog::create([
            'created_by' => $createdUser->id,
            'created_for' => $createdFor->id,
        ]);
    }
}
