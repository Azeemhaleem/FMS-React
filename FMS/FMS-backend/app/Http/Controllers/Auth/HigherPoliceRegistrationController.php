<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HigherPolice;
use App\Models\PoliceInDept;
use App\Models\PoliceUser;
use App\Http\Controllers\Auth\AdminRegistrationController;
use Illuminate\Support\Facades\Hash;
use App\Models\Roles;

class HigherPoliceRegistrationController extends Controller
{
    public function registerNewHigherPolice(Request $request) {
        $messege = AdminRegistrationController::registerNewPolice($request);
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
            'role_id' => Roles::where('name', 'higher_officer')->first()->id,
        ]);
        $higherPolice = HigherPolice::create([
            'police_in_dept_id' => $policeInDept->id,
            'police_user_id' => $user->id
        ]);
        AdminRegistrationController::logAccountCreation($request->user(), $user);
        return response()->json([
            'messege' => 'Higher Police created successfully',
            'higherPolice' => $higherPolice
        ], 200);
    }
}
