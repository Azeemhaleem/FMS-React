<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use App\Models\TrafficPolice;

class EnsureTPoliceIsInService
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $police_user = $request->user();

        $tpolice = TrafficPolice::where('police_user_id', $police_user->id)->first();
        if (!$tpolice || !$tpolice->in_service) {
            return response()->json([
                'messege' => 'You are not authorized to perform this action'
            ], 400);
        }

        return $next($request);
    }
}
