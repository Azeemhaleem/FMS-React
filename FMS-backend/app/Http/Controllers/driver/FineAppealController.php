<?php

namespace App\Http\Controllers\driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ChargedFine;
use App\Models\FineAppealRequest;
use App\Services\PoliceHierarchyService;
use App\Models\PoliceUser;

use App\Notifications\FineAppealRequestedNotification;

class FineAppealController extends Controller
{
    protected $policeHierarchyService;

    public function __construct(PoliceHierarchyService $policeHierarchyService) {
        $this->policeHierarchyService = $policeHierarchyService;
    }

    public function appealFine(Request $request) {
        $driverUser = $request->user();
        $request->validate([
            'fine_id' => 'required|exists:charged_fines,id',
            'reason' => 'nullable|string'
        ]);

        $fine = ChargedFine::find($request->fine_id);
        
        if ($fine->driver_user_id != $driverUser->id) {
            return response()->json([
                'message' => 'You can only appeal your own fines.',
            ], 403);
        }

        if (FineAppealRequest::where('fine_id', $request->fine_id)->exists()) {
            return response()->json([
                'message' => 'You can only appeal a fine once.',
            ], 400);
        }

        DB::transaction(function () use ($request, $fine) {     
            FineAppealRequest::create([
                'fine_id' => $fine->id,
                'asked_at' => now(),
                'reason' => $request->reason ?? null
            ]);
    
            $fine->update([
                'appeal_requested' => true
            ]);
        });

        $trafficPoliceId = $fine->police_user_id;
        $trafficPolice = PoliceUser::find($trafficPoliceId);

        $higherOfficer = $this->policeHierarchyService->getAssignedHigherOfficer($trafficPolice);

        if ($higherOfficer) {
            $higherOfficer->notify(new FineAppealRequestedNotification($fine));
            $trafficPolice->notify(new FineAppealRequestedNotification($fine));
        }

        return response()->json([
            'message' => 'Fine appeal request sent successfully.'
        ]);
    }
}
