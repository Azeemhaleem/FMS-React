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
    $status = strtolower($request->query('status', 'all'));

    $query = FineAppealRequest::query()
        ->withTrashed() // include resolved appeals
        ->whereHas('chargedFine', function ($q) use ($driver) {
            // 👈 include soft-deleted charged fines in the whereHas too
            $q->withTrashed()->where('driver_user_id', $driver->id);
        })
        ->with([
            'chargedFine' => function ($q) {
                $q->withTrashed()->with(['fine']);
            }
        ])
        ->orderByDesc('asked_at');

    if ($status === 'open') {
        $query->whereNull('deleted_at');
    } elseif ($status === 'resolved') {
        $query->onlyTrashed();
    }

    $rows = $query->get();

    $payload = $rows->map(function ($r) {
        $isResolved = !is_null($r->deleted_at);
        $status     = $isResolved ? 'Resolved' : 'Pending';

        $decision = null;
        if ($isResolved) {
            if ($r->accepted === true)  $decision = 'Accepted';
            if ($r->accepted === false) $decision = 'Declined';
        }

        $cf   = $r->chargedFine;
        $fine = $cf?->fine;

        return [
            'id'           => (string) $r->id,
            'fine_id'      => (string) $r->fine_id,
            'date'         => optional($r->asked_at)->toIso8601String(),
            'status'       => $status,
            'reason'       => $r->reason,
            'decision'     => $decision,
            'letter_url'   => null,
            'updated_at'   => optional($r->updated_at)->toIso8601String(),
            'resolved_at'  => optional($r->deleted_at)->toIso8601String(),
            'fine_name'    => $fine?->name,
            'fine_amount'  => $fine?->amount,
        ];
    });

    return response()->json($payload, 200);
}

}
