<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

use App\Models\ChargedFine;

class NewFineIssuedNotification extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $chargedFineId;

    /**
     * Create a new notification instance.
     */
    public function __construct($chargedFineId)
    {
        $this->chargedFineId = $chargedFineId;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $chargedFine = ChargedFine::find($this->chargedFineId);
        if (!$chargedFine) {
            return (new MailMessage)
                ->subject('New Fine Issued')
                ->line('A new fine has been issued to you.')
                ->line('Thank you for using our service!');
        }

        return (new MailMessage)
            ->subject('New Fine Issued')
            ->line("A new fine (ID: {$chargedFine->id}) has been issued to you.")
            ->line('Amount: ' . $chargedFine->fine->amount)
            ->line('Issued At: ' . $chargedFine->issued_at->format('Y-m-d H:i'))
            // ->action('View Details', config('app.frontend_url') . '/fines/' . $this->chargedFine->id)
            ->line('Thank you for using our service!');
    }

    public function toDatabase(object $notifiable): array
    {
        $chargedFine = ChargedFine::find($this->chargedFineId);
        if (!$chargedFine) {
            return [
                'charged_fine_id' => 'N/A',
                'message' => 'New fine issued',
                'amount' => 'N/A',
                'issued_at' => 'N/A',
            ];
        }
        
        return [
            'charged_fine_id' => $chargedFine->id,
            'message' => 'New fine issued: ' . $chargedFine->fine->name,
            'amount' => $chargedFine->fine->amount,
            'issued_at' => $chargedFine->issued_at->toIso8601String(),
        ];
    }
}
