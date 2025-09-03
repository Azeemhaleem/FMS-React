<?php

namespace App\Http\Controllers\tpolice;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ChargedFine;

class GetChargedFinesController extends Controller
{
    public function getChargedFinesInLastSevenDays(Request $request)
    {
        $user = $request->user();

        $chargedFines = ChargedFine::where('police_user_id', $user->id)
            ->where('issued_at', '>=', now()->subDays(7))    
            ->get();

        $sendingFines = [];

        foreach ($chargedFines as $fine) {
            $sendingFines[] = [
                'id' => $fine->id,
                'fine_name' => $fine->fine->name,
                'license_no' => $fine->driverUser->driverInDept->license_no,
                'charged_at' => $fine->issued_at
            ];
        }

        return response()->json([
            'fines' => $sendingFines
        ], 200);
    }
}
