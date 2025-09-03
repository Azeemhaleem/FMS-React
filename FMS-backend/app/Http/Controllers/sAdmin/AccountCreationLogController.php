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
        $allLogs = AccountCreationLog::all();
        $returningLogs = [];
        for($i = 0; $i < count($allLogs); $i++) {
            $returningLogs[$i] = [
                'created_by' => self::getPoliceIDAndNameFromUserID($allLogs[$i]->created_by),
                'created_for' => self::getPoliceIDAndNameFromUserID($allLogs[$i]->created_for),
                'created_at' => $allLogs[$i]->created_at
            ];
        }
        return response()->json([
            'logs' => $returningLogs
        ], 200);
    }

    public function getAccountCreationLogsCreatedBy(Request $request) {
        $validated = $request->validate([
            'police_id' => 'required|string|exists:police_in_depts,police_id'
        ]);
        $allLogs = AccountCreationLog::where('created_by', self::getUserIDByPoliceID($validated['police_id']))->get();
        if (count($allLogs) == 0) {
            return response()->json([
                'logs' => [],
                'messege' => 'No logs found'
            ], 200);
        }
        $returningLogs = [];
        for($i = 0; $i < count($allLogs); $i++) {
            $returningLogs[$i] = [
                'created_for' => self::getPoliceIDAndNameFromUserID($allLogs[$i]->created_for),
                'created_at' => $allLogs[$i]->created_at
            ];
        }
        return response()->json([
            'logs' => $returningLogs
        ], 200);
    }

    public function getAccountCreationLogsCreatedFor(Request $request) {
        $validated = $request->validate([
            'police_id' => 'required|string|exists:police_in_depts,police_id'
        ]);
        $police_id = $validated['police_id'];
        $allLogs = AccountCreationLog::where('created_for', self::getUserIDByPoliceID($police_id))->get();
        if (count($allLogs) == 0) {
            return response()->json([
                'logs' => [],
                'messege' => 'No logs found'
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
        $policeInDeptID = PoliceInDept::where('police_id', $police_id)->first()->id;
        $police = Admin::where('police_in_dept_id', $policeInDeptID)->first();
        if (!$police) {
            $police = HigherPolice::where('police_in_dept_id', $policeInDeptID)->first();
            if (!$police) {
                $police = TrafficPolice::where('police_in_dept_id', $policeInDeptID)->first();
            }
        }
        if ($police) {
            return $police->police_user_id;
        }
    }

    private static function getPoliceIDAndNameFromUserID($userID) {
        $police = Admin::where('police_user_id', $userID)->first();
        if (!$police) {
            $police = HigherPolice::where('police_user_id', $userID)->first();
            if (!$police) {
                $police = TrafficPolice::where('police_user_id', $userID)->first();
            }
        }
        if ($police) {
            $police = PoliceInDept::where('id', $police->police_in_dept_id)->first();
            return [
                'police_id' => $police->police_id,
                'police_name' => $police->full_name
            ];
        }
    }
}
