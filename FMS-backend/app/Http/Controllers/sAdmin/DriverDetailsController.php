<?php

namespace App\Http\Controllers\sAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\DriverInDept;
use App\Models\DriverUser;

class DriverDetailsController extends Controller
{
    public function getDriverDetailsByLicenseNumber(Request $request){
        $validated = $request->validate([
            'license_number' => 'bail|required|string|exists:driver_in_depts,license_no',
        ]);

        // CHANGE: safer to use validated value instead of $request->license_number
        $driver_in_dept = DriverInDept::where('license_no', $validated['license_number'])->first();

        if (!$driver_in_dept) {
            // CHANGE: guard in case record was deleted after validation
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $driver_user = DriverUser::where('driver_in_dept_id', $driver_in_dept->id)->first();

        return response()->json([
            'driver_in_dept' => $driver_in_dept,
            // CHANGE: key name "police_user" is misleading → should be "driver_user"
            // but if frontend already depends on "police_user", leave as-is for now
            'police_user' => $driver_user
        ], 200);
    }
}
