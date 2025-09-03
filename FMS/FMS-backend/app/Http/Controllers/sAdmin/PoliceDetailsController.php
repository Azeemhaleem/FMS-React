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
        $police_in_dept = PoliceInDept::where('police_id', $request->police_id)->first();

        $policeUser = $police_in_dept->policeUser;
        $role = $policeUser->role_name;

        return response()->json([
            'police_in_dept' => $police_in_dept,
            'police_user' => $policeUser,
            'role' => $role
        ], 200);
    }
}
