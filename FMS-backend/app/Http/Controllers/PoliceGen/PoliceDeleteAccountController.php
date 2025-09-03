<?php

namespace App\Http\Controllers\PoliceGen;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PoliceDeleteAccountController extends Controller
{
    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        $user->tokens()->delete();
        $user->delete();
        return response()->json([
            'message' => 'Account deleted successfully.'
        ]);
    }
}
