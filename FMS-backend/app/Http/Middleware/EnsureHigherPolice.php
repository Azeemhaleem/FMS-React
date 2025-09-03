<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use App\Models\HigherPolice;
use App\Models\PoliceUser;

class EnsureHigherPolice
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $higherPolice = HigherPolice::where('police_user_id', $user->id)->first();
        $policeUser = PoliceUser::where('id', $user->id)->first();
        if (!$higherPolice || !($user->username == $policeUser->username)) {
            return response()->json([
                'messege' => 'Only higher police can access this route'
            ], 400);
        }

        return $next($request);
    }
}
