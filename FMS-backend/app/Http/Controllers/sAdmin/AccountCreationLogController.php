<?php

namespace App\Http\Controllers\sAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\AccountCreationLog;
use App\Models\Admin;
use App\Models\HigherPolice;
use App\Models\TrafficPolice;
use App\Models\PoliceInDept;

class AccountCreationLogController extends Controller
{
    public function getAllAccountCreationLogs() {
        // CHANGE: order newest first to make large lists predictable (no behavior break).
        $allLogs = AccountCreationLog::orderByDesc('created_at')->get();

        $returningLogs = [];
        for($i = 0; $i < count($allLogs); $i++) {
            $returningLogs[$i] = [
                // CHANGE: helpers already return array|null; keep as-is but safe for null consumers.
                'created_by'  => self::getPoliceIDAndNameFromUserID($allLogs[$i]->created_by),
                'created_for' => self::getPoliceIDAndNameFromUserID($allLogs[$i]->created_for),
                'created_at'  => $allLogs[$i]->created_at
            ];
        }
        return response()->json([
            'logs' => $returningLogs
        ], 200);
    }

    public function getAccountCreationLogsCreatedBy(Request $request) {
         // make route {police_id} available to validator
        $request->merge(['police_id' => $request->route('police_id')]);
        $validated = $request->validate([
            'police_id' => 'required|string|exists:police_in_depts,police_id'
        ]);

        // CHANGE: null-safe lookup. Previously could call where('created_by', null).
        $creatorUserId = self::getUserIDByPoliceID($validated['police_id']);
        if (!$creatorUserId) {
            return response()->json([
                'logs'    => [],
                'message' => 'No logs found' // CHANGE: fix key typo "messege" -> "message"
            ], 200);
        }

        $allLogs = AccountCreationLog::where('created_by', $creatorUserId)
            ->orderByDesc('created_at') // CHANGE: stable ordering
            ->get();

        if (count($allLogs) == 0) {
            return response()->json([
                'logs'    => [],
                'message' => 'No logs found' // CHANGE: fix key typo
            ], 200);
        }

        $returningLogs = [];
        for($i = 0; $i < count($allLogs); $i++) {
            $returningLogs[$i] = [
                'created_for' => self::getPoliceIDAndNameFromUserID($allLogs[$i]->created_for),
                'created_at'  => $allLogs[$i]->created_at
            ];
        }
        return response()->json([
            'logs' => $returningLogs
        ], 200);
    }

    public function getAccountCreationLogsCreatedFor(Request $request) {
        // make route {police_id} available to validator
        $request->merge(['police_id' => $request->route('police_id')]);
        $validated = $request->validate([
            'police_id' => 'required|string|exists:police_in_depts,police_id'
        ]);

        $police_id = $validated['police_id'];

        // CHANGE: null-safe lookup like above.
        $createdForUserId = self::getUserIDByPoliceID($police_id);
        if (!$createdForUserId) {
            return response()->json([
                'logs'    => [],
                'message' => 'No logs found' // CHANGE: fix key typo
            ], 200);
        }

        $allLogs = AccountCreationLog::where('created_for', $createdForUserId)
            ->orderByDesc('created_at') // CHANGE: stable ordering
            ->get();

        if (count($allLogs) == 0) {
            return response()->json([
                'logs'    => [],
                'message' => 'No logs found' // CHANGE: fix key typo
            ], 200);
        }

        $returningLogs = [];
        for($i = 0; $i < count($allLogs); $i++) {
            $returningLogs[$i] = [
                'created_by' => self::getPoliceIDAndNameFromUserID($allLogs[$i]->created_by),
                'created_at' => $allLogs[$i]->created_at
            ];
        }
        return response()->json([
            'logs' => $returningLogs
        ], 200);
    }

    private static function getUserIDByPoliceID($police_id) {
        // CHANGE: prevent null dereference if police_id not found.
        $policeInDept = PoliceInDept::where('police_id', $police_id)->first();
        if (!$policeInDept) {
            return null; // early return; callers already handle null
        }

        // CHANGE: short-circuit lookups; no behavior change, just safer.
        $police = Admin::where('police_in_dept_id', $policeInDept->id)->first();
        if (!$police) {
            $police = HigherPolice::where('police_in_dept_id', $policeInDept->id)->first();
            if (!$police) {
                $police = TrafficPolice::where('police_in_dept_id', $policeInDept->id)->first();
            }
        }
        if ($police) {
            return $police->police_user_id;
        }
        // CHANGE: explicit null if no mapping record exists.
        return null;
    }

    private static function getPoliceIDAndNameFromUserID($userID) {
        // CHANGE: if $userID is null/0, skip queries to avoid errors.
        if (!$userID) {
            return null;
        }

        $police = Admin::where('police_user_id', $userID)->first();
        if (!$police) {
            $police = HigherPolice::where('police_user_id', $userID)->first();
            if (!$police) {
                $police = TrafficPolice::where('police_user_id', $userID)->first();
            }
        }

        if ($police) {
            // CHANGE: null-safe find for the related PoliceInDept record.
            $pid = PoliceInDept::find($police->police_in_dept_id);
            if (!$pid) {
                return null;
            }
            return [
                'police_id'   => $pid->police_id,
                'police_name' => $pid->full_name
            ];
        }

        // CHANGE: explicit null when no match.
        return null;
    }
}
