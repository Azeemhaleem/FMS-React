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

    public function via($notifiable)
    {
        return ['mail', 'database'];
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
            'message' => 'Fine expiring in 2 days',
        ];
    }
}