<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\ChargedFine;
use App\Models\FineAppealRequest;

class FineAppealRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected ChargedFine $chargedFine;
    protected ?FineAppealRequest $appealRequest;

    public function __construct(ChargedFine $chargedFine)
    {
        $this->chargedFine   = $chargedFine->loadMissing('fine', 'driverUser.driverInDept');
        $this->appealRequest = FineAppealRequest::where('fine_id', $chargedFine->id)->first();
    }

    public function via($notifiable): array
    {
        $channels = ['database']; // always store in DB
        if (!empty($notifiable->receives_email_notifications)) {
            $channels[] = 'mail'; // email only if enabled
        }
        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $meta = $this->buildMeta();

        return (new MailMessage)
            ->subject('New Fine Appeal Request')
            ->line(($meta['driver_name'] ?? 'A driver') . ' submitted an appeal.')
            ->line('Fine: '.($meta['fine_name'] ?? 'N/A').' (ID '.$this->chargedFine->id.')')
            ->line('Reason: '.($meta['reason'] ?? '—'))
            ->line('Appeal At: '.($meta['asked_at'] ?? '—'))
            ->action('Open Appeals', url('/admin/fine-appeals/'.$this->chargedFine->id))
            ->line('Please review and take action.');
    }

    public function toArray(object $notifiable): array
    {
        // The frontend looks for message + type + meta
        return [
            'message' => 'A new appeal request has been submitted.',
            'type'    => 'appeal.requested',
            'meta'    => $this->buildMeta(),
        ];
    }

    private function buildMeta(): array
    {
        $driver     = $this->chargedFine->driverUser;
        $dept       = $driver?->driverInDept; // full_name, license_no live here
        $fine       = $this->chargedFine->fine;

        return [
            'fine_id'     => (string) $this->chargedFine->id,
            'fine_name'   => $fine->name ?? null,
            'amount'      => $fine->amount ?? null,

            'driver_name' => $dept->full_name
                ?? $driver?->username
                ?? null,
            'license_no'  => $dept->license_no ?? null,

            'reason'      => $this->appealRequest->reason ?? null,
            'asked_at'    => optional($this->appealRequest?->asked_at)->toIso8601String(),
            'issued_at'   => optional($this->chargedFine?->issued_at)->toIso8601String(),
        ];
    }
}
