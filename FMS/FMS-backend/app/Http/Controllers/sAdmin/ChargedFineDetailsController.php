<?php

namespace App\Http\Controllers\sAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ChargedFine;
use App\Models\PoliceInDept;
use App\Models\TrafficPolice;
use App\Models\PoliceUser;

class ChargedFineDetailsController extends Controller
{
    public function chargedFinesBySpecificTrafficPoliceByPoliceId(Request $request)
    {
        $request->validate([
            'traffic_police_id' => 'required|exists:police_in_depts,police_id',
        ]);

        $trafficPoliceInDept = PoliceInDept::where('police_id', $request->traffic_police_id)->first();
        if (!$trafficPoliceInDept) {
            return response()->json([
                'messege' => 'Invalid traffic police id'
            ], 400);
        }

        $trafficPoliceUserId = TrafficPolice::where('police_in_dept_id', $trafficPoliceInDept->id)->first()->police_user_id;

        $policeUser = PoliceUser::where('id', $trafficPoliceUserId)->first();

        if (!$policeUser) {
            return response()->json([
                'messege' => 'Invalid traffic police id'
            ], 400);
        }

        $chargedFines = ChargedFine::withTrashed()
        ->where('police_user_id', $policeUser->id)
        ->orderBy('issued_at', 'desc')
        ->limit(10)
        ->get();

        return response()->json([
            'messege' => 'Charged fines fetched successfully',
            'chargedFines' => $chargedFines
        ], 200);
    }

    public function findTrafficPoliceByChargedFineId(Request $request) {
        $request->validate([
            'fine_id' => 'required|exists:charged_fines,id',
        ]);

        $fine = ChargedFine::withTrashed()->where('id', $request->fine_id)->first();

        $policeUser = PoliceUser::where('id', $fine->police_user_id)->first();

        $trafficPolice = TrafficPolice::where('police_user_id', $policeUser->id)->first()->police_in_dept_id;
        $policeId = PoliceInDept::where('id', $trafficPolice)->first()->police_id;

        return response()->json([
            'messege' => 'Traffic police fetched successfully',
            'policeId' => $policeId
        ], 200);
    }
}
