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
                'message' => 'Invalid traffic police id' // CHANGE: fix key typo "messege" -> "message"
            ], 400);
        }

        // CHANGE: avoid null deref on ->first()->police_user_id; use value() for single column
        $trafficPoliceUserId = TrafficPolice::where('police_in_dept_id', $trafficPoliceInDept->id)->value('police_user_id');
        if (!$trafficPoliceUserId) {
            return response()->json([
                'message' => 'Invalid traffic police id' // CHANGE: consistent key
            ], 400);
        }

        // CHANGE: existence check is enough; no need to load full model unless used later
        $policeUserExists = PoliceUser::where('id', $trafficPoliceUserId)->exists();
        if (!$policeUserExists) {
            return response()->json([
                'message' => 'Invalid traffic police id' // CHANGE: consistent key
            ], 400);
        }

        $chargedFines = ChargedFine::withTrashed()
            ->where('police_user_id', $trafficPoliceUserId) // CHANGE: use id we already have
            ->orderByDesc('issued_at')                      // CHANGE: same sort, clearer API
            ->limit(10)
            ->get();

        return response()->json([
            'message'       => 'Charged fines fetched successfully', // CHANGE: key typo
            'chargedFines'  => $chargedFines
        ], 200);
    }

    public function findTrafficPoliceByChargedFineId(Request $request) {
        $request->validate([
            'fine_id' => 'required|exists:charged_fines,id',
        ]);

        $fine = ChargedFine::withTrashed()->find($request->fine_id);
        if (!$fine) {
            // CHANGE: defensive guard even though validated; avoids rare race conditions
            return response()->json(['message' => 'Fine not found'], 404);
        }

        // CHANGE: avoid loading full user; we only need to map to traffic police record
        $policeUserId = $fine->police_user_id;
        if (!$policeUserId) {
            return response()->json(['message' => 'Police user not found for this fine'], 404);
        }

        // CHANGE: avoid ->first()->police_in_dept_id null deref; use value() + guard
        $trafficPoliceInDeptId = TrafficPolice::where('police_user_id', $policeUserId)->value('police_in_dept_id');
        if (!$trafficPoliceInDeptId) {
            return response()->json(['message' => 'Traffic police not found for this fine'], 404);
        }

        // CHANGE: use value() and guard
        $policeId = PoliceInDept::where('id', $trafficPoliceInDeptId)->value('police_id');
        if (!$policeId) {
            return response()->json(['message' => 'Police ID not found'], 404);
        }

        return response()->json([
            'message'  => 'Traffic police fetched successfully', // CHANGE: key typo
            'policeId' => $policeId
        ], 200);
    }
}
