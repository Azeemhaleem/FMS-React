<?php

namespace App\Http\Controllers\hPolice;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\ChargedFine;
use App\Models\FineDeletingRequests;
use App\Services\PoliceHierarchyService;

class HPoliceDeleteFineController extends Controller
{
    protected $policeHierarchyService;

    public function __construct(PoliceHierarchyService $policeHierarchyService)
    {
        $this->policeHierarchyService = $policeHierarchyService;
    }

    public function getAllFinesToDelete(Request $request)
    {
        $higherPolice = $request->user();
        $trafficOfficers = $this->policeHierarchyService->getAssignedTrafficOfficers($higherPolice);

        $finesToDelete = [];

        foreach ($trafficOfficers as $trafficOfficer) {
            $chargedFines = ChargedFine::where('police_user_id', $trafficOfficer->id)
                ->where('pending_delete', true)
                ->whereNull('deleted_at')
                ->whereIn('fine_id', function ($query) {
                    $query->select('fine_id')
                        ->from('fine_deleting_requests')
                        ->whereNull('deleted_at');
                })
                ->with(['fine', 'driverUser', 'policeUser'])
                ->get();

            $finesToDelete = array_merge($finesToDelete, $chargedFines->all());
        }

        return response()->json([
            'finesToDelete' => $finesToDelete,
        ], 200);
    }

    public function approveFineDeletion(Request $request)
    {
        $request->validate([
            'fine_id' => 'required|exists:charged_fines,id',
        ]);

        $higherOfficer = $request->user();

        DB::beginTransaction();

        try {
            $fineDeletingRequest = FineDeletingRequests::where('fine_id', $request->fine_id)
                ->whereNull('deleted_at')
                ->first();

            if (!$fineDeletingRequest) {
                return response()->json([
                    'message' => 'No pending fine deletion request found for this fine.'
                ], 404);
            }

            $chargedFine = ChargedFine::where('id', $request->fine_id)
                ->where('pending_delete', true)
                ->whereNull('deleted_at')
                ->first();

            if (!$chargedFine) {
                return response()->json([
                    'message' => 'No eligible charged fine found for deletion.'
                ], 404);
            }

            $assignedTrafficOfficerIds = $this->policeHierarchyService
                ->getAssignedTrafficOfficers($higherOfficer)
                ->pluck('id');

            if (!$assignedTrafficOfficerIds->contains($chargedFine->police_user_id)) {
                return response()->json([
                    'message' => 'Unauthorized to approve deletion for this fine.'
                ], 403);
            }

            $chargedFine->delete();

            $fineDeletingRequest->deleted_at = now();
            $fineDeletingRequest->deleted_by = $higherOfficer->id;
            $fineDeletingRequest->accepted = true;
            $fineDeletingRequest->save();

            DB::commit();
            $officer = $chargedFine->policeUser;    // issuing officer
            $driver  = $chargedFine->driverUser;

            $officer?->notify(new \App\Notifications\FineDeletionApprovedNotification());

            $driver?->notify(new \App\Notifications\SystemEventNotification(
                'A fine on your account was removed by a higher officer.',
                'fine.deletion_approved',
                ['fine_id' => (string)$chargedFine->id]
            ));


            return response()->json([
                'message' => 'Fine deletion approved and processed successfully.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error approving fine deletion: " . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred during the approval process.'
            ], 500);
        }
    }

    public function declineFineDeletion(Request $request)
    {
        $request->validate([
            'fine_id' => 'required|exists:charged_fines,id',
        ]);

        $higherOfficer = $request->user();

        DB::beginTransaction();

        try {
            $fineDeletingRequest = FineDeletingRequests::where('fine_id', $request->fine_id)
                ->whereNull('deleted_at')
                ->first();

            if (!$fineDeletingRequest) {
                return response()->json([
                    'message' => 'No pending fine deletion request found for this fine.'
                ], 404);
            }

            $chargedFine = ChargedFine::where('id', $request->fine_id)
                ->where('pending_delete', true)
                ->whereNull('deleted_at')
                ->first();

            if (!$chargedFine) {
                return response()->json([
                    'message' => 'No eligible charged fine found for processing.'
                ], 404);
            }

            $assignedTrafficOfficerIds = $this->policeHierarchyService
                ->getAssignedTrafficOfficers($higherOfficer)
                ->pluck('id');

            if (!$assignedTrafficOfficerIds->contains($chargedFine->police_user_id)) {
                return response()->json([
                    'message' => 'Unauthorized to decline deletion for this fine.'
                ], 403);
            }

            $fineDeletingRequest->deleted_at = now();
            $fineDeletingRequest->reason = $request->decline_reason ?? null;
            $fineDeletingRequest->accepted = false;
            $fineDeletingRequest->deleted_by = $higherOfficer->id;
            $fineDeletingRequest->save();

            $chargedFine->pending_delete = false;
            $chargedFine->save();

            DB::commit();

            $officer = $chargedFine->policeUser;

            $officer?->notify(new \App\Notifications\SystemEventNotification(
                'Your fine deletion request was declined.',
                'fine.deletion_declined',
                [
                'fine_id' => (string)$chargedFine->id,
                'reason'  => $request->decline_reason ?? null
                ]
            ));


            return response()->json([
                'message' => 'Fine deletion request has been declined successfully.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error declining fine deletion: " . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while processing the decline.'
            ], 500);
        }
    }
}
