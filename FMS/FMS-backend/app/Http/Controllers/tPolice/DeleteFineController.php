<?php

namespace App\Http\Controllers\tPolice;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChargedFine;
use App\Models\FineDeletingRequests;
use App\Models\HigherPoliceTrafficPolice;
use App\Models\PoliceUser;
use App\Notifications\FineDeletionRequested;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use App\Models\TrafficPolice;
use App\Models\PoliceInDept;
use App\Models\HigherPolice;
use App\Services\PoliceHierarchyService;

use Illuminate\Support\Facades\Log;

class DeleteFineController extends Controller
{
    protected $policeHierarchyService;

    public function __construct(PoliceHierarchyService $policeHierarchyService)
    {
        $this->policeHierarchyService = $policeHierarchyService;
    }

    public function deleteFineRequest(Request $request)
    {
        $trafficOfficer = $request->user();
        $fine = ChargedFine::where('police_user_id', $trafficOfficer->id)
                        ->where('pending_delete', false)
                        ->whereNull('deleted_at')
                        ->orderBy('issued_at', 'desc')
                        ->first();

        if (!$fine) {
            return response()->json(['message' => 'No eligible fine found to request deletion for.'], 404);
        }

        DB::beginTransaction();

        try {
            FineDeletingRequests::create([
                'fine_id' => $fine->id,
                'deleted_by' => $trafficOfficer->id,
                'asked_at' => now(),
            ]);

            $fine->pending_delete = true;
            $fine->save();

            $higherOfficer = $this->policeHierarchyService->getAssignedHigherOfficer($trafficOfficer);

            if (!$higherOfficer) {
                DB::rollBack();
                Log::error("Data Inconsistency: PoliceUser record not found for higher officer user id: {$higherOfficerUserId}");
                return response()->json(['message' => 'Could not find user account for the assigned higher officer.'], 500);
            }

            $higherOfficer->notify(new FineDeletionRequested($fine, $trafficOfficer));
            Log::info("Notifying Higher Officer (User ID: {$higherOfficer->id}) about fine deletion request for Fine ID: {$fine->fine_id}");

            DB::commit();

            return response()->json([
                'message' => 'Fine delete request sent successfully for fine ID: ' . $fine->fine_id . '.
                                \nA notification has been sent to the higher officer.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error($e->getMessage());
            return response()->json([
                'message' => 'An error occurred while processing the request.'
            ], 500);
        }
    }

    public function getLastFine(Request $request) {
        $fine = ChargedFine::where('police_user_id', $request->user()->id)
                        ->where('pending_delete', false)
                        ->whereNull('deleted_at')
                        ->orderBy('issued_at', 'desc')
                        ->first();

        return response()->json($fine);
    }
}