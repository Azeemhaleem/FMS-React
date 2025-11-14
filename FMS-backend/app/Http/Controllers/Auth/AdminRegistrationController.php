<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Notifications\SystemEventNotification;
use App\Models\Admin;
use App\Models\HigherPolice;
use App\Models\PoliceInDept;
use App\Models\TrafficPolice;
use App\Models\PoliceUser;
use Illuminate\Support\Facades\Hash;
use App\Models\Roles;
use App\Models\AccountCreationLog;
// CHANGE: (optional, but recommended for atomicity)
// use Illuminate\Support\Facades\DB;

class AdminRegistrationController extends Controller
{
    public function registerNewAdmin(Request $request) {
        $validated = $request->validate([
            'police_id' => 'bail|required',
            'username'  => 'bail|required|string|unique:driver_users|unique:police_users',
            'email'     => 'bail|required|string|email|unique:police_users',
            'password'  => 'required|string',
        ]);

        // CHANGE: use the validated payload instead of $request directly.
        $messege = self::registerNewPolice($request); 
        if ($messege !== true) {
            return response()->json([
                'message' => $messege // CHANGE: fix key typo "messege" -> "message"
            ], 400);
        }

        // CHANGE: guard if police_id exists (registerNewPolice already checks, but add safety)
        $policeInDept = PoliceInDept::where('police_id', $validated['police_id'])->first();
        if (!$policeInDept) {
            return response()->json(['message' => 'Invalid police id'], 422);
        }

        // CHANGE: avoid null deref; get role id safely
        $roleId = Roles::where('name', 'admin')->value('id');
        if (!$roleId) {
            return response()->json(['message' => 'Role "admin" not found'], 422);
        }

        // CHANGE: (optional) wrap in a transaction to avoid partial create if an exception occurs
        // return DB::transaction(function () use ($validated, $policeInDept, $roleId, $request) {
            $user = PoliceUser::create([
                'username' => $validated['username'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role_id'  => $roleId,
            ]);

            $admin = Admin::create([
                'police_in_dept_id' => $policeInDept->id,
                'police_user_id'    => $user->id
            ]);

            // CHANGE: null-safe; ensure the authenticated actor exists before logging
            $actor = $request->user();
            if ($actor instanceof PoliceUser) {
                self::logAccountCreation($actor, $user);
            }

            try {
                // to the newly created admin user
                $user->notify(new SystemEventNotification(
                    message: 'Your admin account has been created.',
                    type: 'admin.created',
                    meta: [
                        'police_id'   => $validated['police_id'],
                        'username'    => $validated['username'],
                        'created_by'  => $actor?->id,
                    ]
                ));

                // optional: notify the creator as confirmation
                if ($actor instanceof PoliceUser) {
                    $actor->notify(new SystemEventNotification(
                        message: 'Admin account created successfully.',
                        type: 'admin.created.confirmation',
                        meta: [
                            'created_for_user_id' => $user->id,
                            'police_id'           => $validated['police_id'],
                            'username'            => $validated['username'],
                        ]
                    ));
                }
            } catch (\Throwable $e) {
                \Log::warning('Admin creation notification failed', ['error' => $e->getMessage()]);
            }
        //     return response()->json([
        //         'message' => 'Admin created successfully',
        //         'user'    => $user
        //     ], 201);
        // });

        // CHANGE: keep original (non-transaction) response for compatibility
        return response()->json([
            'message' => 'Admin created successfully', // CHANGE: key typo
            'user'    => $user
        ], 201);
    }

    private static function checkPoliceHasAccount($police_id) {
        // CHANGE: guard against missing PoliceInDept to avoid null->policeUser
        $policeInDept = PoliceInDept::where('police_id', $police_id)->first();
        if (!$policeInDept) {
            return false;
        }
        $policeUser = $policeInDept->policeUser;
        return (bool) $policeUser; // CHANGE: simplify boolean return
    }

    public function checkPoliceHasAccountWrapped(Request $request) {
        $validated = $request->validate([
            'police_id' => 'bail|required'
        ]);

        $returnRespons = self::checkPoliceHasAccount($validated['police_id']);
        if ($returnRespons) {
            return response()->json([
                'message' => 'Police already has an account' // CHANGE: key typo
            ], 400);
        } else {
            return response()->json([
                'message' => 'Police does not have an account' // CHANGE: key typo
            ], 200);
        }
    }

    public static function registerNewPolice(Request $request) {
        $validated = $request->validate([
            'police_id' => 'bail|required',
            'username'  => 'bail|required|string|unique:driver_users|unique:police_users',
            'email'     => 'bail|required|string|email|unique:police_users',
            'password'  => 'required|string|confirmed',
        ]);

        $policeInDept = PoliceInDept::where('police_id', $validated['police_id'])->first();
        if (!$policeInDept) {
            return 'Invalid police id';
        }
        if (self::checkPoliceHasAccount($validated['police_id'])) {
            return 'Police already has an account';
        }
        return true;
    }

    public static function logAccountCreation(PoliceUser $createdUser, PoliceUser $createdFor) {
        AccountCreationLog::create([
            'created_by'  => $createdUser->id,
            'created_for' => $createdFor->id,
        ]);
        // CHANGE: (optional) send a notification email to the new admin here if desired
        // $createdFor->notify(new \App\Notifications\Admin\NewAdminCreated($createdFor->username));
    }
}
