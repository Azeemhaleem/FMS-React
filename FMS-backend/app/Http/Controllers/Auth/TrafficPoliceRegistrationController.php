<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\TrafficPolice;
use App\Models\PoliceInDept;
use App\Models\PoliceUser;
use App\Http\Controllers\Auth\AdminRegistrationController;
use Illuminate\Support\Facades\Hash;
use App\Models\Roles;

class TrafficPoliceRegistrationController extends Controller
{
    public function registerNewTrafficPolice(Request $request) {
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
            'role_id' => Roles::where('name', 'traffic_officer')->first()->id,
        ]);
        $trafficPolice = TrafficPolice::create([
            'police_in_dept_id' => $policeInDept->id,
            'police_user_id' => $user->id
        ]);
        AdminRegistrationController::logAccountCreation($request->user(), $user);
        return response()->json([
            'messege' => 'Traffic Police created successfully',
            'trafficPolice' => $trafficPolice
        ], 200);
    }

    public function assignToHigherPolice(Request $request) {
        $request->validate([
            'traffic_police_id' => 'bail|required|exists:police_in_depts,police_id',
            'higher_police_id' => 'bail|required|exists:police_in_depts,police_id',
        ]);
        $trafficPoliceInDept = PoliceInDept::where('police_id', $request->traffic_police_id)->first();
        if (!$trafficPoliceInDept) {
            return response()->json([
                'messege' => 'Invalid traffic police id'
            ], 400);
        }
        $higherPoliceInDept = PoliceInDept::where('police_id', $request->higher_police_id)->first();
        if (!$higherPoliceInDept) {
            return response()->json([
                'messege' => 'Invalid higher police id'
            ], 400);
        }

        $existingAssignment = HigherPoliceTrafficPolice::where('traffic_police_id', $request->traffic_police_id)->first();

        if ($existingAssignment) {
            return response()->json([
                'message' => 'Traffic police already assigned to higher police',
                'data' => $existingAssignment,
            ], 200);

        } else {
            $newAssignment = new HigherPoliceTrafficPolice();
            $newAssignment->traffic_police_id = $request->traffic_police_id;
            $newAssignment->higher_police_id = $request->higher_police_id;
            $newAssignment->assigned_at = now();
            $newAssignment->assigned_times = 1;
            $newAssignment->save();

            return response()->json([
                'message' => 'Traffic police assigned to higher police successfully',
                'data' => $newAssignment,
            ], 201);
        }
    }
}
