<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use App\Models\DriverUser;

class EnsureDriver
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $driver = DriverUser::where('id', $user->id)->first();
        if (!$driver || $driver->username != $user->username) {
            return response()->json([
                'messege' => 'Only driver can access this route'
            ], 400);
        }

        return $next($request);
    }
}
