<?php

namespace App\Http\Controllers\sAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChargedFine;
use App\Models\PoliceInDept;
use PDF;

class PdfGenerateController extends Controller
{
    public function generatePDF(Request $request)
    {
        $request->validate([
            'police_id' => 'required|exists:police_in_depts,police_id',
        ]);

        $policeinDept = PoliceInDept::where('police_id', $request->police_id)->firstOrFail();

        // keep the same logic you had:
        $policeUser = optional($policeinDept->trafficPolice)->policeUser;
        if (!$policeUser) {
            return response()->json(['error' => 'Associated police user not found'], 404);
        }

        // ⬅️ add eager load for 'fine' (name) and 'driverUser'
        $fines = ChargedFine::withTrashed()
            ->where('police_user_id', $policeUser->id)
            ->with(['driverUser.driverInDept', 'fine'])   // <-- added 'fine'
            ->get();

        // Build the data with fine_name instead of fine_id
        $generatingData = $fines->map(function ($fine) {
            return (object) [
                'id'              => $fine->id,
                'fine_name'       => optional($fine->fine)->name ?? 'N/A', // <-- name here
                'driver_license'  => optional(optional($fine->driverUser)->driverInDept)->license_no ?? 'N/A',
                'issued_at'       => $fine->issued_at ? $fine->issued_at->format('Y-m-d H:i:s') : 'N/A',
            ];
        });

        $pdf = PDF::loadView('pdf.pdfTemplate', [
            'fines'        => $generatingData,
            'policeUserId' => $request->police_id,
        ]);

        return $pdf->download("charged_fines_by_{$request->police_id}.pdf");
    }
}
