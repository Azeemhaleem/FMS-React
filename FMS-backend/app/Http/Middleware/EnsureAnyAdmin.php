<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureSuperAdmin;

class EnsureAnyAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isAdmin = false;
        $isSuperAdmin = false;
        try {
            (new EnsureAdmin())->handle($request, function ($request) use (&$isAdmin) {
                $isAdmin = true;
                return $request;
            });
        } catch (\Throwable $th) {
            // do nothing
        }
        try {
            (new EnsureSuperAdmin())->handle($request, function ($request) use (&$isSuperAdmin) {
                $isSuperAdmin = true;
                return $request;
            });
        } catch (\Throwable $th) {
            // do nothing
        }

        if ($isAdmin || $isSuperAdmin) {
            return $next($request);
        }

        return response()->json([
            'messege' => 'Only admins or super admins can access this route'
        ], 400);
    }
}
