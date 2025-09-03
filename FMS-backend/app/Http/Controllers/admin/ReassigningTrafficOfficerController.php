<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Services\PoliceHierarchyService;
use App\Models\HigherPoliceTrafficPolice;
use App\Models\HigherPolice;
use App\Models\PoliceInDept;
use App\Models\TrafficPolice;
use App\Models\PoliceUser;


class ReassigningTrafficOfficerController extends Controller
{
    protected $policeHierarchyService;

    public function __construct(PoliceHierarchyService $policeHierarchyService) {
        $this->policeHierarchyService = $policeHierarchyService;
    }

    public function getTOfficerWithAssignedHOfficer(Request $request) {
        $validated = $request->validate([
            'police_id' => 'required|string|exists:police_in_depts,police_id',
        ]);

        $policeInDept = PoliceInDept::where('police_id', $validated['police_id'])->first();
        $tOfficer = $policeInDept->policeUser;

        if (!$tOfficer->trafficPolice) {
            return response()->json([
                'error' => 'The Traffic officer ID provided is not a traffic officer'
            ]);
        }

        $assignedHOfficer = $this->policeHierarchyService->getAssignedHigherOfficer($tOfficer);

        $higherOfficerdeptId = PoliceInDept::where(
            'id', HigherPolice::where('police_user_id', $assignedHOfficer->id
                )->first()->police_in_dept_id
                    )->first()->police_id;

        return response()->json([
            'traffic_officer' => $validated['police_id'],
            'assigned_higher_officer' => $higherOfficerdeptId,
        ], 200);
    }

    public function reassignTrafficOfficer(Request $request) {
        $validated = $request->validate([
            'traffic_officer_police_id' => 'required|string|exists:police_in_depts,police_id',
            'new_higher_officer_police_id' => 'required|string|exists:police_in_depts,police_id',
        ]);

        $policeInDept = PoliceInDept::where('police_id', $validated['traffic_officer_police_id'])->first();
        $tofficer = $policeInDept->policeUser;

        if (!$tofficer->trafficPolice) {
            return response()->json([
                'error' => 'The Traffic officer ID provided is not a traffic officer'
            ]);
        }

        $assignedHOfficer = $this->policeHierarchyService->getAssignedHigherOfficer($tofficer);
        
        $newHOfficerpoliceInDept = PoliceInDept::where('police_id', $validated['new_higher_officer_police_id'])->first();
        $newHOfficer = $newHOfficerpoliceInDept->policeUser;

        if (!$newHOfficer->higherPolice) {
            return response()->json([
                'error' => 'The higher officer ID provided is not a higher officer'
            ]);
        }

        $oldRecord = HigherPoliceTrafficPolice::where(
            'higher_police_id', $assignedHOfficer->policeInDept->police_id
        )->where(
            'traffic_police_id', $tofficer->policeInDept->police_id
        )->latest()->firstOrFail();
        $oldRecord->unassigned_at = now();
        $oldRecord->save();

        $newRecord = new HigherPoliceTrafficPolice();
        $newRecord->traffic_police_id = $tofficer->policeInDept->police_id;
        $newRecord->higher_police_id = $newHOfficer->policeInDept->police_id;
        $newRecord->assigned_at = now();
        $newRecord->save();

        return response()->json([
            'message' => 'Traffic Officer Reassigned Successfully to ' . $validated['new_higher_officer_police_id'],
        ], 200);
    }
}