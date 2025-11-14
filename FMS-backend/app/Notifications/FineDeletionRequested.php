<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\ChargedFine;
use App\Models\PoliceUser;

class FineDeletionRequested extends Notification implements ShouldQueue
{
    use Queueable;

    public ChargedFine $chargedFine;
    public PoliceUser $requestingOfficer;

    /**
     * Create a new notification instance.
     */
    public function __construct(ChargedFine $chargedFine, PoliceUser $requestingOfficer)
    {
        $this->chargedFine = $chargedFine;
        $this->requestingOfficer = $requestingOfficer;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via($notifiable): array
{
    $channels = ['database']; // <-- always write to DB so UI works
    if (!empty($notifiable->receives_email_notifications)) {
        $channels[] = 'mail'; // <-- only email if toggle is ON
    }
    return $channels;
}

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $reviewUrl = url('/admin/fine-delete-requests/' . $this->chargedFine->id); 

        return (new MailMessage)
                    ->subject('Fine Deletion Request Submitted')
                    ->greeting('Hello!')
                    ->line('Traffic Police Officer ' . $this->requestingOfficer->name . ' (ID: ' . $this->requestingOfficer->id . ') has requested the deletion of a fine.')
                    ->line('Fine ID: ' . $this->chargedFine->id)
                    ->line('Issued At: ' . $this->chargedFine->issued_at->format('Y-m-d H:i:s'))
                    ->action('Review Request', $reviewUrl)
                    ->line('Thank you for your attention.');
    }

    /**
     * Get the array representation of the notification (for database storage).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Fine deletion requested by Officer',
            'fine_id' => $this->chargedFine->id,
            'charged_fine_id' => $this->chargedFine->id,
            'requesting_officer_id' => $this->requestingOfficer->id,
            'issued_at' => $this->chargedFine->issued_at->toIso8601String(),
            'link' => '/admin/fine-delete-requests/' . $this->chargedFine->id, // Adjust URL as needed
        ];
    }
}