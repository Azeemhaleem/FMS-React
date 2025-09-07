<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FineExpiryReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected $fine;

    public function __construct($fine)
    {
        $this->fine = $fine;
    }

    public function via($notifiable): array
{
    $channels = ['database']; // <-- always write to DB so UI works
    if (!empty($notifiable->receives_email_notifications)) {
        $channels[] = 'mail'; // <-- only email if toggle is ON
    }
    return $channels;
}

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Fine Expiry Reminder')
            ->line("Your fine #{$this->fine->id} is due to expire in 2 days.")
            ->line('Please pay before the expiry date to avoid penalties.')
            ->action('Pay Fine', url('/fines/' . $this->fine->id))
            ->line('Thank you!');
    }

    public function toArray($notifiable)
{
    return [
        'fine_id' => $this->fine->id,
        'message' => "Fine #{$this->fine->id} expires in 2 days",
        'type'    => 'fine.expiring',
        'issued_at' => optional($this->fine->issued_at)->toIso8601String(),
        'expires_at'=> optional($this->fine->expires_at)->toIso8601String(),
    ];
}

}