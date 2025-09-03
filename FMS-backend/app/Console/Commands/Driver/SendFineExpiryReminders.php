<?php

namespace App\Console\Commands\Driver;

use Illuminate\Console\Command;
use App\Models\ChargedFine;
use App\Notifications\FineExpiryReminder;
use Illuminate\Support\Facades\Log;

class SendFineExpiryReminders extends Command
{
    protected $signature = 'fines:send-expiry-reminders';
    protected $description = 'Send notifications for fines expiring in 2 days';

    public function handle()
    {
        $targetDate = now()->addDays(2)->toDateString();
        
        ChargedFine::whereDate('expires_at', $targetDate)
            ->whereNull('paid_at')
            ->whereNull('deleted_at')
            ->where('pending_delete', false)
            ->where('appeal_requested', false)
            ->with(['driverUser'])
            ->chunk(100, function ($fines) {
                foreach ($fines as $fine) {
                    try {
                        if ($fine->driverUser) {
                            $fine->driverUser->notify(new FineExpiryReminder($fine));
                            $this->info("Notified user for fine #{$fine->id}");
                        }
                    } catch (\Exception $e) {
                        Log::error("Notification failed for fine #{$fine->id}: " . $e->getMessage());
                    }
                }
            });

        $this->info('Expiry reminders processed successfully');
    }
}