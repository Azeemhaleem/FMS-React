<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use App\Console\Commands\Driver\SendFineExpiryReminders;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Artisan::command('fines:send-expiry-reminders', function () {
    $this->call(SendFineExpiryReminders::class);
})->describe('Send fine expiry reminders');