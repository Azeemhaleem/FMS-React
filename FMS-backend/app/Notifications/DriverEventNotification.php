<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class DriverEventNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $message,
        public string $type = 'generic',
        public array  $meta = []
    ) {}

    public function via($notifiable): array
    {
        $channels = ['database'];
        if (!empty($notifiable->receives_email_notifications)) {
            $channels[] = 'mail';
        }
        return $channels;
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Notification')
            ->line($this->message);
    }

    public function toArray($notifiable): array
    {
        return [
            'message' => $this->message,
            'type'    => $this->type,
            'meta'    => $this->meta,
        ];
    }
}
