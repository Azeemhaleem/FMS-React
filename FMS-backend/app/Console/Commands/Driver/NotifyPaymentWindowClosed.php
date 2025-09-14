<?php
namespace App\Console\Commands\Driver;

use Illuminate\Console\Command;
use App\Models\ChargedFine;

class NotifyPaymentWindowClosed extends Command
{
    protected $signature = 'fines:notify-payment-window-closed';
    protected $description = 'Notify drivers once when the 14-day payment window closes';

    public function handle(): int
    {
        ChargedFine::whereNull('paid_at')
            ->whereNull('deleted_at')
            ->where('appeal_requested', false)
            ->where('pending_delete', false)
            ->whereNull('payment_closed_notified_at')
            ->get()
            ->each(function ($fine) {
                if (!$fine->isPayable()) {
                    $fine->driverUser?->notify(
                        new \App\Notifications\SystemEventNotification(
                            'The payment window closed for a fine. You must appear in court.',
                            'fine.payment_window_closed',
                            [
                                'fine_id'  => (string)$fine->id,
                                'deadline' => $fine->deadline_at_iso,
                            ]
                        )
                    );
                    $fine->forceFill(['payment_closed_notified_at' => now()])->save();
                }
            });

        return self::SUCCESS;
    }
}
