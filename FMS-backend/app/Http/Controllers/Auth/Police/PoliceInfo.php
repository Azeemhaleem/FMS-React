<?php

namespace App\Http\Controllers\Auth\Police;

use App\Http\Controllers\Controller;
use App\Models\PoliceInDept;
use Illuminate\Http\Request;

class PoliceInfo extends Controller
{
    public function getAllOfficers()
    {
        $officers = PoliceInDept::with('admin', 'higherPolice', 'trafficPolice')->get();

        return response()->json([
            'success' => true,
            'message' => 'All officers retrieved successfully',
            'data' => $officers
        ], 200);
    

        // If not found → return 404
        if (!$officer) {
            return response()->json([
                'success' => false,
                'message' => 'Officer not found',
            ], 404);
        }


    }
}