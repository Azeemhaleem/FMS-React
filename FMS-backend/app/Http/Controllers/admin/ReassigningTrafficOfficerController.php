<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Notifications\SystemEventNotification;

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

    public function getTOfficerWithAssignedHOfficer(Request $request)
    {
        $validated = $request->validate([
            'police_id' => 'required|string|exists:police_in_depts,police_id',
        ]);

        $policeInDept = PoliceInDept::where('police_id', $validated['police_id'])->first();
        $user = $policeInDept?->policeUser;

        if (!$user?->trafficPolice) {
            return response()->json(['messege' => 'Provided ID is not a traffic officer'], 400);
        }

        // Read the ACTIVE assignment (unassigned_at IS NULL) by department-level IDs
        $active = HigherPoliceTrafficPolice::where('traffic_police_id', $validated['police_id'])
            ->whereNull('unassigned_at')
            ->orderByDesc('assigned_at')   // safe even if null
            ->first();

        return response()->json([
            'traffic_officer'         => $validated['police_id'],
            'assigned_higher_officer' => $active?->higher_police_id,  // already a police_in_depts.police_id
        ], 200);
    }

    public function reassignTrafficOfficer(Request $request)
    {
        $validated = $request->validate([
            'traffic_officer_police_id'    => 'required|string|exists:police_in_depts,police_id',
            'new_higher_officer_police_id' => 'required|string|exists:police_in_depts,police_id',
        ]);

        $policeInDept = PoliceInDept::where('police_id', $validated['traffic_officer_police_id'])->first();
        $tofficer     = $policeInDept?->policeUser;

        if (!$tofficer?->trafficPolice) {
            return response()->json(['error' => 'The Traffic officer ID provided is not a traffic officer'], 400);
        }

        $newHPI = PoliceInDept::where('police_id', $validated['new_higher_officer_police_id'])->first();
        $newHigher = $newHPI?->policeUser;
        if (!$newHigher?->higherPolice) {
            return response()->json(['error' => 'The higher officer ID provided is not a higher officer'], 400);
        }

        // Active assignment (your table stores police_in_depts.police_id values)
        $current = HigherPoliceTrafficPolice::where('traffic_police_id', $validated['traffic_officer_police_id'])
            ->first(); // <- unique index probably exists on traffic_police_id

        if (!$current) {
            return response()->json(['message' => 'This traffic officer is not currently assigned. Use Assign instead.'], 409);
        }

        if ((string)$current->higher_police_id === (string)$validated['new_higher_officer_police_id']) {
            return response()->json(['message' => 'Already assigned to this higher officer.', 'data' => $current], 200);
        }

        // ---- UPDATE IN PLACE (no new row -> no UNIQUE violation) ----
        $oldHigherId = $current->higher_police_id;

        $current->higher_police_id = $validated['new_higher_officer_police_id'];
        $current->assigned_at = now();      // refresh start time
        $current->unassigned_at = null;     // keep "active" semantics
        $current->save();

        // Notify
        $tofficer->notify(new SystemEventNotification(
            'You have been reassigned to Higher Officer '.$validated['new_higher_officer_police_id'].'.',
            'officer.reassigned',
            [
                'old_higher'    => $oldHigherId,
                'new_higher'    => $validated['new_higher_officer_police_id'],
                'assignment_id' => $current->id,
            ]
        ));

        $oldHigherUser = PoliceInDept::where('police_id', $oldHigherId)->first()?->policeUser;
        $oldHigherUser?->notify(new SystemEventNotification(
            'Traffic officer '.$validated['traffic_officer_police_id'].' has been reassigned away from you.',
            'officer.reassigned_out',
            [
                'traffic'       => $validated['traffic_officer_police_id'],
                'new_higher'    => $validated['new_higher_officer_police_id'],
                'assignment_id' => $current->id,
            ]
        ));

        $newHigher->notify(new SystemEventNotification(
            'Traffic officer '.$validated['traffic_officer_police_id'].' has been assigned to you.',
            'officer.reassigned_in',
            [
                'traffic'       => $validated['traffic_officer_police_id'],
                'old_higher'    => $oldHigherId,
                'assignment_id' => $current->id,
            ]
        ));

        return response()->json(['message' => 'Traffic Officer Reassigned Successfully to '.$validated['new_higher_officer_police_id']], 200);
    }
}