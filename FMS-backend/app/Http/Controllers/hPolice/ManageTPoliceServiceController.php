<?php

namespace App\Http\Controllers\hPolice;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Services\PoliceHierarchyService;
use App\Models\TrafficPolice;

class ManageTPoliceServiceController extends Controller
{
    protected $policeHierarchyService;

    public function __construct(PoliceHierarchyService $policeHierarchyService) {
        $this->policeHierarchyService = $policeHierarchyService;
    }

    public function getAllTrafficPolice(Request $request) {
        $hPolice = $request->user();
        $trafficOfficers = $this->policeHierarchyService->getAssignedTrafficOfficers($hPolice);

        return response()->json([
            'trafficOfficers' => $trafficOfficers,
        ], 200);
    }

    // below function is for traffic officers access. not for the higher police
    public function getTPoliceServiceStatus(Request $request) {
        $police_user = $request->user();

        $tPolice = TrafficPolice::where('police_user_id', $police_user->id)->first();
        $status = $tPolice->in_service;

        return response()->json([
            'messege' => 'Traffic police service status fetched successfully',
            'status' => $status,
        ], 200);
    }

    public function getTPoliceServiceStatusByPoliceUserId(Request $request) {
        $validated = $request->validate([
            'police_user_id' => 'required|exists:police_users,id',
        ]);

        $hPolice = $request->user();
        $alltPoliceBelongtoHPolice = $this->policeHierarchyService->getAssignedTrafficOfficers($hPolice);
        
        $tPoliceIdBelongtoHPolice = false;
        foreach ($alltPoliceBelongtoHPolice as $tPolice) {
            if ($tPolice->id == $request->police_user_id) {
                $tPoliceIdBelongtoHPolice = true;
            }
        }

        if (!$tPoliceIdBelongtoHPolice) {
            return response()->json([
                'messege' => 'You are not authorized to perform this action'
            ], 400);
        }

        $tPolice = TrafficPolice::where('police_user_id', $request->police_user_id)->first();
        $status = $tPolice->in_service;

        return response()->json([
            'messege' => 'Traffic police ' . $request->police_user_id . ' service status fetched successfully',
            'status' => $status,
        ], 200);
    }

    public function activateTPoliceOfficer(Request $request) {
        $validated = $request->validate([
            'police_user_id' => 'required|exists:police_users,id',
            'service_region' => 'required|string',
        ]);

        $hPolice = $request->user();
        $alltPoliceBelongtoHPolice = $this->policeHierarchyService->getAssignedTrafficOfficers($hPolice);
        
        $tPoliceIdBelongtoHPolice = false;
        foreach ($alltPoliceBelongtoHPolice as $tPolice) {
            if ($tPolice->id == $request->police_user_id) {
                $tPoliceIdBelongtoHPolice = true;
            }
        }

        if (!$tPoliceIdBelongtoHPolice) {
            return response()->json([
                'messege' => 'You are not authorized to perform this action'
            ], 400);
        }

        $tPolice = TrafficPolice::where('police_user_id', $request->police_user_id)->first();
        $tPolice->in_service = true;
        $tPolice->service_region = $request->service_region;
        $tPolice->save();
        $tPolice->policeUser?->notify(new \App\Notifications\SystemEventNotification(
            'Your account has been activated for service region '.$request->service_region.'.',
            'officer.activated',
            ['service_region' => $request->service_region]
        ));


        return response()->json([
            'messege' => 'Traffic police ' . $request->police_user_id . ' activated successfully',
        ], 200);
    }

    public function deactivateTPoliceOfficer(Request $request) {
        $validated = $request->validate([
            'police_user_id' => 'required|exists:police_users,id',
        ]);

        $hPolice = $request->user();
        $alltPoliceBelongtoHPolice = $this->policeHierarchyService->getAssignedTrafficOfficers($hPolice);
        
        $tPoliceIdBelongtoHPolice = false;
        foreach ($alltPoliceBelongtoHPolice as $tPolice) {
            if ($tPolice->id == $request->police_user_id) {
                $tPoliceIdBelongtoHPolice = true;
            }
        }

        if (!$tPoliceIdBelongtoHPolice) {
            return response()->json([
                'messege' => 'You are not authorized to perform this action'
            ], 400);
        }

        $tPolice = TrafficPolice::where('police_user_id', $request->police_user_id)->first();
        $tPolice->in_service = false;
        $tPolice->service_region = null;
        $tPolice->save();
        $tPolice->policeUser?->notify(new \App\Notifications\SystemEventNotification(
            'Your account has been deactivated.',
            'officer.deactivated'
        ));


        return response()->json([
            'messege' => 'Traffic police ' . $request->police_user_id . ' deactivated successfully',
        ], 200);
    }
}
