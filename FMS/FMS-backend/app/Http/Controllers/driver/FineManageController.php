<?php

namespace App\Http\Controllers\driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ChargedFine;

class FineManageController extends Controller
{
    public function getAllFines(Request $request) {
        $fines = ChargedFine::with('fine')
            ->where('driver_user_id', $request->user()->id)->get();
        return response()->json($fines);
    }

    public function getAllUnpaidFines(Request $request) {
        $fines = ChargedFine::with('fine')
            ->where('driver_user_id', $request->user()->id)
                    ->where('pending_delete', false)
                    ->where('appeal_requested', false)
                    ->where('paid_at', null)
                    ->get();
        return response()->json($fines);
    }

    public function getRecentlyPaidFines(Request $request) {
        $fines = ChargedFine::with('fine')
            ->where('driver_user_id', $request->user()->id)
                    ->where('pending_delete', false)
                    ->where('appeal_requested', false)
                    ->whereNotNull('paid_at')
                    ->latest('paid_at')
                    ->take(10)
                    ->get();
        return response()->json($fines);
    }
}
