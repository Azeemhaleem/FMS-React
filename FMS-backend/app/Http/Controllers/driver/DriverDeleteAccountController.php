<?php
namespace App\Http\Controllers\driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DriverDeleteAccountController extends Controller
{
    public function deleteAccount(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->chargedFines()->where('paid_at', null)->count() > 0) {
                return response()->json([
                    'message' => 'You cannot delete your account while you have outstanding fines.'
                ], 403); //403 forbidden
            }
            
            DB::transaction(function () use ($user) {
                $user->tokens()->delete();
                
                Log::info('User account deleted', ['user_id' => $user->id]);
                
                $user->delete();
            });
            
            return response()->json([
                'message' => 'Account deleted successfully.'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error deleting user account', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'An error occurred while deleting your account. Please try again.'
            ], 500);
        }
    }
}