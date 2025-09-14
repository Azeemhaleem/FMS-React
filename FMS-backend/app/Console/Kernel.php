<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Register the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // 2 days before expiry reminder
        $schedule->command('fines:send-expiry-reminders')->dailyAt('08:00');

        // Notify as soon as the 14-day window closes
        $schedule->command('fines:notify-payment-window-closed')->hourly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        // Auto-discovers commands in app/Console/Commands/**
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
