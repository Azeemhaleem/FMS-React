<?php

namespace App\Http\Controllers\sAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChargedFine;
use App\Models\Fine;
use App\Models\DriverUser;
use Illuminate\Support\Facades\DB;

class AdminOverviewController extends Controller
{
    public function overview(Request $request)
    {
        $now     = now();
        $last7   = $now->copy()->subDays(7);
        $last24h = $now->copy()->subDay();

        // Totals (join to fines to get proper amounts)
        $totalRecordedCount = ChargedFine::withTrashed()->count();

        $totalRecordedAmount = ChargedFine::withTrashed()
            ->join('fines', 'fines.id', '=', 'charged_fines.fine_id')
            ->sum('fines.amount');

        $paid = ChargedFine::whereNotNull('paid_at');

        $totalPaidCount = (clone $paid)->count();
        $totalPaidAmount = (clone $paid)
            ->join('fines', 'fines.id', '=', 'charged_fines.fine_id')
            ->sum('fines.amount');

        // Processing = not paid and not deleted
        $processingCount = ChargedFine::whereNull('paid_at')
            ->whereNull('deleted_at')
            ->count();

        // Last 7 days / 24h
        $recordedLast7 = ChargedFine::withTrashed()->where('issued_at', '>=', $last7)->count();
        $paidLast7 = ChargedFine::whereNotNull('paid_at')->where('paid_at', '>=', $last7)->count();

        $recordedLast24 = ChargedFine::withTrashed()->where('issued_at', '>=', $last24h)->count();
        $paidLast24 = ChargedFine::whereNotNull('paid_at')->where('paid_at', '>=', $last24h)->count();

        $newDriversLast24 = DriverUser::where('created_at', '>=', $last24h)->count();

        // Recent updates (simple unified feed)
        $recentPayments = ChargedFine::whereNotNull('paid_at')
            ->orderByDesc('paid_at')->limit(5)
            ->join('fines', 'fines.id', '=', 'charged_fines.fine_id')
            ->get([
                'charged_fines.id as charged_fine_id',
                'charged_fines.paid_at as ts',
                'fines.name as fine_name',
                DB::raw("'payment' as kind")
            ]);

        $recentCharges = ChargedFine::withTrashed()
            ->orderByDesc('issued_at')->limit(5)
            ->join('fines', 'fines.id', '=', 'charged_fines.fine_id')
            ->get([
                'charged_fines.id as charged_fine_id',
                'charged_fines.issued_at as ts',
                'fines.name as fine_name',
                DB::raw("'charge' as kind")
            ]);

        $recentDrivers = DriverUser::orderByDesc('created_at')->limit(5)->get([
            'id', 'created_at as ts', DB::raw("'' as fine_name"), DB::raw("'driver' as kind")
        ]);

        // Merge + sort + trim 10
        $recent = collect()
            ->merge($recentPayments)
            ->merge($recentCharges)
            ->merge($recentDrivers)
            ->sortByDesc('ts')
            ->values()
            ->take(10)
            ->map(function ($r) {
                return [
                    'kind'   => $r->kind,
                    'ts'     => $r->ts,
                    'title'  => match ($r->kind) {
                        'payment' => "Payment received",
                        'charge'  => "Fine recorded",
                        'driver'  => "New driver",
                        default   => "Update",
                    },
                    'detail' => match ($r->kind) {
                        'payment' => "Charged Fine #{$r->charged_fine_id} · {$r->fine_name}",
                        'charge'  => "Charged Fine #{$r->charged_fine_id} · {$r->fine_name}",
                        'driver'  => "Driver User #{$r->id}",
                        default   => null,
                    }
                ];
            });

        return response()->json([
            'totals' => [
                'recorded'        => ['count' => $totalRecordedCount, 'amount' => $totalRecordedAmount],
                'paid'            => ['count' => $totalPaidCount,     'amount' => $totalPaidAmount],
                'processingCount' => $processingCount,
            ],
            'windows' => [
                'last7days' => ['recorded' => $recordedLast7, 'paid' => $paidLast7],
                'last24h'   => ['recorded' => $recordedLast24, 'paid' => $paidLast24, 'newDrivers' => $newDriversLast24],
            ],
            'recent' => $recent,
            'as_of'  => $now->toIso8601String(),
        ]);
    }
}
