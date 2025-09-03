<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use App\Models\PoliceUser;

use App\Models\Admin;

class EnsureSuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $superadmin = Admin::where('police_user_id', $user->id)->where('is_super_admin', true)->first();
        $policeUser = PoliceUser::where('id', $user->id)->first();
        if (!$superadmin || !($policeUser->username == $user->username)) {
            return response()->json([
                'messege' => 'Only super admin can access this route'
            ], 400);
        }
        return $next($request);
    }
}
