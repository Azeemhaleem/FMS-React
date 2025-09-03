<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use App\Models\TrafficPolice;
use App\Models\PoliceUser;

class EnsureTrafficPolice
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $trafficPolice = TrafficPolice::where('police_user_id', $user->id)->first();
        $policeUser = PoliceUser::where('id', $user->id)->first();
        if (!$trafficPolice || !($policeUser->username == $user->username)) {
            return response()->json([
                'messege' => 'Only traffic police can access this route'
            ], 400);
        }
        return $next($request);
    }
}
