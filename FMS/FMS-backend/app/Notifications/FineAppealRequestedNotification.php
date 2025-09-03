<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\ChargedFine;
use App\Models\FineAppealRequest;

class FineAppealRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $chargedFine;
    protected $appealRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(ChargedFine $chargedFine)
    {
        $this->chargedFine = $chargedFine;
        $this->appealRequest = FineAppealRequest::where('fine_id', $chargedFine->id)->first();
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
        $driverName = $this->chargedFine->driverUser->name;
        $fineId = $this->chargedFine->id;
        $appealReason = $this->appealRequest ? $this->appealRequest->reason : 'No reason provided.';
        $appealDate = $this->appealRequest ? $this->appealRequest->asked_at->format('Y-m-d H:i:s') : 'N/A';
        $fineIssueDate = $this->chargedFine->issued_at ? $this->chargedFine->issued_at->format('Y-m-d H:i:s') : 'N/A';

        return (new MailMessage)
                    ->subject('New Fine Appeal Request')
                    ->line("A new appeal request has been submitted for Fine ID: {$fineId}.")
                    ->line("Driver Name: {$driverName}")
                    ->line("Fine Issued On: {$fineIssueDate}")
                    ->line("Appeal Requested On: {$appealDate}")
                    ->line("Reason for Appeal:")
                    ->line($appealReason)
                    ->action('View Appeal Details', url('/admin/fine-appeals/' . $fineId)) // Replace with your actual admin appeal view URL
                    ->line('Please review the appeal and take appropriate action.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $driverName = $this->chargedFine->driverUser->name;
        $fineId = $this->chargedFine->id;
        $appealReason = $this->appealRequest ? $this->appealRequest->reason : 'No reason provided.';
        $appealDate = $this->appealRequest ? $this->appealRequest->asked_at->format('Y-m-d H:i:s') : 'N/A';
        $fineIssueDate = $this->chargedFine->issued_at ? $this->chargedFine->issued_at->format('Y-m-d H:i:s') : 'N/A';

        return [
            'message' => "A new appeal request has been submitted for Fine ID: {$fineId} by {$driverName}.",
            'fine_id' => $fineId,
            'driver_name' => $driverName,
            'appeal_reason' => $appealReason,
            'appeal_date' => $appealDate,
            'fine_issue_date' => $fineIssueDate,
        ];
    }
}