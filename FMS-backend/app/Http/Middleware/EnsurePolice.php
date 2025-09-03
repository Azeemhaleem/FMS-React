<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use App\Models\PoliceUser;

class EnsurePolice
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $police = PoliceUser::where('id', $user->id)->first();

        if (!$police || $police->username != $user->username) {
            return response()->json([
                'messege' => 'Only police can access this route'
            ], 400);
        }    

        return $next($request);
    }
}
