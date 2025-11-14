<?php

namespace App\Http\Controllers\hPolice;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Services\PoliceHierarchyService;
use App\Models\FineAppealRequest;
use App\Models\ChargedFine;
use App\Models\PoliceUser;
use Illuminate\Support\Facades\DB;

class HPoliceAppealHandlingController extends Controller
{
    protected $policeHierarchyService;

    public function __construct(PoliceHierarchyService $policeHierarchyService) {
        $this->policeHierarchyService = $policeHierarchyService;
    }

    public function getAllAppeals(Request $request) {
        $higherPolice = $request->user();

        $trafficOfficers = $this->policeHierarchyService->getAssignedTrafficOfficers($higherPolice);

        if ($trafficOfficers->isEmpty()) {
            return response()->json(['appeals' => []], 200);
        }

        $trafficOfficerIds = $trafficOfficers->pluck('id');

        $appeals = FineAppealRequest::whereNull('deleted_at')
            ->whereHas('chargedFine', function ($query) use ($trafficOfficerIds) {
                $query->whereIn('police_user_id', $trafficOfficerIds);
            })
            ->with([
                'chargedFine' => function ($query) {
                    $query->with([
                        'fine',
                        'driverUser',
                        'issuingPoliceOfficer'
                    ])->withTrashed();
                }
            ])
            ->orderBy('asked_at', 'desc')
            ->get();

        return response()->json(['appeals' => $appeals], 200);
    }

    public function acceptAppeal(Request $request)
    {
        $higherOfficer = $request->user();

        $appealId = $request->input('appeal_id');

        if (!$appealId) {
            return response()->json(['message' => 'Missing appeal ID.'], 400);
        }

        $appeal = FineAppealRequest::find($appealId);

        if (!$appeal) {
            return response()->json(['message' => 'Appeal not found.'], 404);
        }

        if ($appeal->trashed()) {
            return response()->json(['message' => 'This appeal has already been processed.'], 409);
        }

        try {
            $appeal->load(['chargedFine.issuingPoliceOfficer']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Could not load related fine data.'], 500);
        }

        $chargedFine = $appeal->chargedFine;

        if (!$chargedFine) {
            return response()->json(['message' => 'Associated fine record not found.'], 404);
        }

        if (!$chargedFine->issuingPoliceOfficer) {
            return response()->json(['message' => 'Issuing officer record for the fine not found.'], 404);
        }

        $issuingOfficerId = $chargedFine->issuingPoliceOfficer->id;
        $subordinateIds = $this->policeHierarchyService->getAssignedTrafficOfficers($higherOfficer)->pluck('id');

        if (!$subordinateIds->contains($issuingOfficerId)) {
            return response()->json(['message' => 'You are not authorized to handle appeals for fines issued by this officer.'], 403);
        }

        try {
            DB::transaction(function () use ($appeal, $chargedFine, $higherOfficer) {
                $chargedFine->delete();
                $chargedFine->save();

                $appeal->accepted = true;
                $appeal->delete();
            });

            // after the transaction block, when things are committed:
            $driver  = $chargedFine->driverUser;
            $officer = $chargedFine->issuingPoliceOfficer?->policeUser ?? $chargedFine->issuingPoliceOfficer;

            $driver?->notify(new \App\Notifications\SystemEventNotification(
                'Your appeal was accepted. The fine has been cancelled.',
                'appeal.accepted',
                ['fine_id' => (string)$chargedFine->id]
            ));

            $officer?->notify(new \App\Notifications\SystemEventNotification(
                'Appeal accepted: the fine you issued (ID '.$chargedFine->id.') has been cancelled.',
                'appeal.accepted',
                ['fine_id' => (string)$chargedFine->id]
            ));


            return response()->json(['message' => 'Fine appeal accepted successfully. The fine has been cancelled.'], 200);

        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to accept the appeal due to a server error.'], 500);
        }
    }

    public function declineAppeal(Request $request)
    {
        $higherOfficer = $request->user();
        $appealId = $request->input('appeal_id');

        if (!$appealId) {
            return response()->json(['message' => 'Missing appeal ID.'], 400);
        }
        try {
            $appeal = FineAppealRequest::with(['chargedFine' => function ($query) {
                $query->withTrashed()->with(['issuingPoliceOfficer']);
            }])->findOrFail($appealId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Appeal not found.'], 404);
        }

        if ($appeal->trashed()) {
            return response()->json(['message' => 'This appeal has already been processed.'], 409);
        }

        $chargedFine = $appeal->chargedFine;

        if (!$chargedFine) {
            return response()->json(['message' => 'Associated fine record could not be loaded for authorization check.'], 404);
        }

        if (!$chargedFine->issuingPoliceOfficer) {
            return response()->json(['message' => 'Issuing officer record for the fine not found.'], 404);
        }

        $issuingOfficerId = $chargedFine->issuingPoliceOfficer->id;
        $subordinateIds = $this->policeHierarchyService->getAssignedTrafficOfficers($higherOfficer)->pluck('id');

        if (!$subordinateIds->contains($issuingOfficerId)) {
            return response()->json(['message' => 'You are not authorized to handle appeals for fines issued by this officer.'], 403); // 403 Forbidden
        }

        try {
            DB::transaction(function () use ($appeal, $chargedFine) {
                $chargedFine->appeal_requested = false;
                $chargedFine->save();

                $appeal->accepted = false;
                $appeal->delete();
            });

            $driver  = $chargedFine->driverUser;
            $officer = $chargedFine->issuingPoliceOfficer?->policeUser ?? $chargedFine->issuingPoliceOfficer;

            $driver?->notify(new \App\Notifications\SystemEventNotification(
                'Your appeal was declined. The fine remains active.',
                'appeal.declined',
                ['fine_id' => (string)$chargedFine->id]
            ));

            $officer?->notify(new \App\Notifications\SystemEventNotification(
                'Appeal declined for fine ID '.$chargedFine->id.'.',
                'appeal.declined',
                ['fine_id' => (string)$chargedFine->id]
            ));

            return response()->json(['message' => 'Fine appeal declined successfully. The fine remains active.'], 200);

        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to decline the appeal due to a server error.'], 500);
        }
    }
}