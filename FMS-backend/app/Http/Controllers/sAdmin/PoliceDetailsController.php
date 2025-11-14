<?php

namespace App\Http\Controllers\sAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PoliceInDept;

class PoliceDetailsController extends Controller
{
    public function getPoliceDetailsByPoliceId(Request $request) {
        $validated = $request->validate([
            'police_id' => 'bail|required|string|exists:police_in_depts,police_id',
        ]);

        // CHANGE: safer to use $validated['police_id'] instead of $request->police_id
        $police_in_dept = PoliceInDept::where('police_id', $validated['police_id'])->first();

        if (!$police_in_dept) {
            // CHANGE: guard if record deleted after validation
            return response()->json(['message' => 'Police not found'], 404);
        }

        $policeUser = $police_in_dept->policeUser; // accessor handles role mapping

        if (!$policeUser) {
            // CHANGE: guard if no linked police user
            return response()->json(['message' => 'Associated police user not found'], 404);
        }

        // CHANGE: null-safe role read
        $role = $policeUser->role_name ?? null;

        return response()->json([
            'police_in_dept' => $police_in_dept,
            'police_user'    => $policeUser,
            'role'           => $role
        ], 200);
    }
}
