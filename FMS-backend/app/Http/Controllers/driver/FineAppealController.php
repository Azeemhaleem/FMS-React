<?php

namespace App\Http\Controllers\driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $driver = $request->user();

        $request->validate([
            'fine_id' => 'required|exists:charged_fines,id',
            'reason'  => 'nullable|string|max:1000',
        ]);

        $fine = ChargedFine::findOrFail($request->fine_id);

        if ($fine->driver_user_id !== $driver->id) {
            return response()->json(['message' => 'You can only appeal your own fines.'], 403);
        }

        if ($fine->appealRequest()->exists()) {
            return response()->json(['message' => 'You can only appeal a fine once.'], 400);
        }

        $created = DB::transaction(function () use ($request, $fine) {
            $appeal = FineAppealRequest::create([
                'fine_id'  => $fine->id,
                'asked_at' => now(),
                'reason'   => $request->reason,
            ]);

            // Either add 'appeal_requested' to $fillable or set and save:
            $fine->appeal_requested = true;
            $fine->save();

            return $appeal->load('chargedFine.fine');
        });

        // Notify chain
        $trafficPolice = PoliceUser::find($fine->police_user_id);
        $higherOfficer = $this->policeHierarchyService->getAssignedHigherOfficer($trafficPolice);
        if ($higherOfficer) {
            $higherOfficer->notify(new FineAppealRequestedNotification($fine));
            $trafficPolice?->notify(new FineAppealRequestedNotification($fine));
        }

        // Notify the driver so it appears in their Notifications page
        $driver->notify(new \App\Notifications\DriverEventNotification(
            message: 'Your appeal was submitted and is pending review.',
            type:    'appeal.submitted',
            meta: [
                'fine_id'    => (string) $fine->id,
                'fine_name'  => optional($fine->fine)->name,
                'amount'     => optional($fine->fine)->amount,
                'asked_at'   => now()->toIso8601String(),
            ],
        ));


        return response()->json([
            'id'          => (string) $created->id,
            'fine_id'     => (string) $created->fine_id,
            'date'        => optional($created->asked_at)->toIso8601String(),
            'status'      => 'Pending',
            'reason'      => $created->reason,
            'decision'    => null,
            'letter_url'  => null,
            'fine_name'   => optional(optional($created->chargedFine)->fine)->name,
            'fine_amount' => optional(optional($created->chargedFine)->fine)->amount,
        ], 201);
    }

    public function myAppeals(Request $request)
    {
        $driver = $request->user();

        $rows = FineAppealRequest::with(['chargedFine.fine'])
            ->whereHas('chargedFine', fn($q) => $q->where('driver_user_id', $driver->id))
            ->latest('asked_at')
            ->get();

        $payload = $rows->map(function ($r) {
            return [
                'id'          => (string) $r->id,
                'fine_id'     => (string) $r->fine_id,
                'date'        => optional($r->asked_at)->toIso8601String(),
                'status'      => 'Pending',
                'reason'      => $r->reason,
                'decision'    => null,
                'letter_url'  => null,
                'fine_name'   => optional(optional($r->chargedFine)->fine)->name,
                'fine_amount' => optional(optional($r->chargedFine)->fine)->amount,
            ];
        });

        return response()->json($payload);
    }
}
