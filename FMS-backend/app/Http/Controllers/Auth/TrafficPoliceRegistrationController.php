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
use App\Models\HigherPoliceTrafficPolice;

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
            $newAssignment->save();

            // Resolve users
            $trafficUser = $trafficPoliceInDept->policeUser;
            $higherUser  = $higherPoliceInDept->policeUser;

            // Guard: ensure correct roles exist
            if (!$trafficUser?->trafficPolice) {
                return response()->json(['messege' => 'Provided traffic_police_id is not a traffic officer'], 400);
            }
            if (!$higherUser?->higherPolice) {
                return response()->json(['messege' => 'Provided higher_police_id is not a higher officer'], 400);
            }

            // Notify Traffic Officer
            $trafficUser->notify(new \App\Notifications\SystemEventNotification(
                'You have been assigned to Higher Officer ' . $request->higher_police_id . '.',
                'officer.assigned',
                [
                    'higher'  => $request->higher_police_id,
                    'traffic' => $request->traffic_police_id,
                    'assignment_id' => $newAssignment->id,
                ]
            ));

            // Notify Higher Officer
            $higherUser->notify(new \App\Notifications\SystemEventNotification(
                'Traffic officer ' . $request->traffic_police_id . ' has been assigned to you.',
                'officer.assigned_in',
                [
                    'higher'  => $request->higher_police_id,
                    'traffic' => $request->traffic_police_id,
                    'assignment_id' => $newAssignment->id,
                ]
            ));


            return response()->json([
                'message' => 'Traffic police assigned to higher police successfully',
                'data' => $newAssignment,
            ], 201);
        }
    }
}
