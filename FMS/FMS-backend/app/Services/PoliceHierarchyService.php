<?php

namespace App\Services;

use App\Models\HigherPolice;
use App\Models\HigherPoliceTrafficPolice;
use App\Models\PoliceInDept;
use App\Models\PoliceUser;
use App\Models\TrafficPolice;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class PoliceHierarchyService
{
    public function getAssignedHigherOfficer(PoliceUser $trafficOfficer): ?PoliceUser
    {
        $trafficPoliceRecord = TrafficPolice::where('police_user_id', $trafficOfficer->id)->first();
        if (!$trafficPoliceRecord) {
            Log::debug("No TrafficPolice record found for user ID: {$trafficOfficer->id}");
            return null;
        }

        $trafficOfficerDeptRecord = PoliceInDept::find($trafficPoliceRecord->police_in_dept_id);
        if (!$trafficOfficerDeptRecord) {
            Log::warning("No PoliceInDept record found for traffic officer's police_in_dept_id: {$trafficPoliceRecord->police_in_dept_id}");
            return null;
        }
        $trafficOfficerPoliceIdString = $trafficOfficerDeptRecord->police_id;

        $assignment = HigherPoliceTrafficPolice::where('traffic_police_id', $trafficOfficerPoliceIdString)
            ->whereNull('unassigned_at')
            ->first();
        if (!$assignment) {
            Log::debug("No active assignment found for traffic officer police_id: {$trafficOfficerPoliceIdString}");
            return null;
        }
        $higherOfficerPoliceIdString = $assignment->higher_police_id;

        $higherOfficerDeptRecord = PoliceInDept::where('police_id', $higherOfficerPoliceIdString)->first();
        if (!$higherOfficerDeptRecord) {
            Log::warning("No PoliceInDept record found for higher officer police_id: {$higherOfficerPoliceIdString}");
            return null;
        }
        $higherOfficerPoliceInDeptId = $higherOfficerDeptRecord->id;

        $higherPoliceRecord = HigherPolice::where('police_in_dept_id', $higherOfficerPoliceInDeptId)->first();
        if (!$higherPoliceRecord) {
            Log::warning("No HigherPolice record found for police_in_dept_id: {$higherOfficerPoliceInDeptId}");
            return null;
        }
        $higherOfficerUserId = $higherPoliceRecord->police_user_id;

        $higherOfficerUser = PoliceUser::find($higherOfficerUserId);
         if (!$higherOfficerUser) {
            Log::warning("PoliceUser not found for higher officer user ID: {$higherOfficerUserId}");
        }
        return $higherOfficerUser;
    }

    public function getAssignedTrafficOfficers(PoliceUser $higherOfficer): Collection
    {
        $higherPoliceRecord = HigherPolice::where('police_user_id', $higherOfficer->id)->first();
        if (!$higherPoliceRecord) {
            Log::debug("No HigherPolice record found for user ID: {$higherOfficer->id}");
            return collect();
        }

        $higherOfficerDeptRecord = PoliceInDept::find($higherPoliceRecord->police_in_dept_id);
        if (!$higherOfficerDeptRecord) {
            Log::warning("No PoliceInDept record found for higher officer's police_in_dept_id: {$higherPoliceRecord->police_in_dept_id}");
            return collect();
        }
        $higherOfficerPoliceIdString = $higherOfficerDeptRecord->police_id;

        $trafficOfficerPoliceIdStrings = HigherPoliceTrafficPolice::where('higher_police_id', $higherOfficerPoliceIdString)
            ->whereNull('unassigned_at')
            ->pluck('traffic_police_id');

        if ($trafficOfficerPoliceIdStrings->isEmpty()) {
             Log::debug("No active assignments found for higher officer police_id: {$higherOfficerPoliceIdString}");
            return collect();
        }

        $trafficOfficerPoliceInDeptIds = PoliceInDept::whereIn('police_id', $trafficOfficerPoliceIdStrings)
                                                ->pluck('id');

        if ($trafficOfficerPoliceInDeptIds->isEmpty()) {
             Log::warning("Found assignments but no corresponding PoliceInDept records for traffic officers: " . $trafficOfficerPoliceIdStrings->implode(', '));
            return collect();
        }

        $trafficOfficerUserIds = TrafficPolice::whereIn('police_in_dept_id', $trafficOfficerPoliceInDeptIds)
                                        ->pluck('police_user_id');

        if ($trafficOfficerUserIds->isEmpty()) {
             Log::warning("Found PoliceInDept records but no corresponding TrafficPolice records for police_in_dept_ids: " . $trafficOfficerPoliceInDeptIds->implode(', '));
            return collect();
        }

        return PoliceUser::whereIn('id', $trafficOfficerUserIds)->get();
    }
}