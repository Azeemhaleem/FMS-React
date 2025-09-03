<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use App\Models\tempDriver;

class EnsureUuidIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $uuid = $request->token;
        if (!tempDriver::where('uuid', $uuid)->exists()) {
            return response()->json([
                'messege' => 'Invalid uuid'
            ], 400);
        }
        return $next($request);
    }
}
