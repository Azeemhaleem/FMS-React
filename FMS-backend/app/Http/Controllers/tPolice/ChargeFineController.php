<?php

namespace App\Http\Controllers\tPolice;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\DriverInDept;
use App\Models\DriverUser;
use App\Models\Fine;
use App\Models\ChargedFine;
use App\Notifications\NewFineIssuedNotification;

class ChargeFineController extends Controller
{
    public function chargeFine(Request $request)
    {
        $request->validate([
            'fine_id' => 'bail|required|exists:fines,id',
            'driver_license_number' => 'bail|required|exists:driver_in_depts,license_no',
        ]);

        $police = $request->user();
        $driver_in_dept = DriverInDept::where('license_no', $request->driver_license_number)->first();
        $driver_user = DriverUser::where('driver_in_dept_id', $driver_in_dept->id)->first();
        if (!$driver_user) {
            return response()->json([
                'messege' => 'Driver doesn\'t have an account'
            ], 400);
        }
        $fine = Fine::where('id', $request->fine_id)->first();
        $charged_fine = ChargedFine::create([
            'driver_user_id' => $driver_user->id,
            'fine_id' => $fine->id,
            'police_user_id' => $police->id,
            'issued_at' => now(),
            'expires_at' => now()->addDays(14)
        ]);

        $charged_fine->driverUser->notify(new NewFineIssuedNotification($charged_fine->id));

        $charged_fine->load('fine');

        return response()->json([
            'messege' => 'Fine charged successfully',
            'charged_fine' => $charged_fine
        ], 200);
    }

    public function getAllFines(Request $request)
    {
        $fines = Fine::all();
        return response()->json([
            'fines' => $fines
        ], 200);
    }

    public function checkLicenseNumber(Request $request)
    {
        $request->validate([
            'driver_license_number' => 'bail|required|exists:driver_in_depts,license_no',
        ]);
        $driver_in_dept = DriverInDept::where('license_no', $request->driver_license_number)->first();
        if (!$driver_in_dept) {
            $messege = 'Invalid license number';
        }
        $driver_user = DriverUser::where('driver_in_dept_id', $driver_in_dept->id)->first();
        if (!$driver_user) {
            $messege = 'Driver doesn\'t have an account';
        } else {
            $messege = 'Valid license number';
        }

        return response()->json([
            'license_no' => $driver_in_dept->license_no,
            'license_id_no' => $driver_in_dept->licence_id_no,
            'full_name' => $driver_in_dept->full_name,
            'license_issued_date' => $driver_in_dept->issued_issued_date,
            'license_expiry_date' => $driver_in_dept->license_expiry_date,
        ], 200);
    }
}
