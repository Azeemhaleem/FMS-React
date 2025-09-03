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
        $driver_in_dept = DriverInDept::where('license_no', $request->license_number)->first();
        $driver_user = DriverUser::where('driver_in_dept_id', $driver_in_dept->id)->first();

        return response()->json([
            'driver_in_dept' => $driver_in_dept,
            'police_user' => $driver_user
        ], 200);
    }
}
