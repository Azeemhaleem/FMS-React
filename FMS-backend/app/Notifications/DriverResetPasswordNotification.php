<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class DriverResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $token;

    public function __construct(string $token)
    {
        $this->token = $token;
    }

    public function via($notifiable): array
{
    $channels = ['database']; // <-- always write to DB so UI works
    if (!empty($notifiable->receives_email_notifications)) {
        $channels[] = 'mail'; // <-- only email if toggle is ON
    }
    return $channels;
}

    public function toMail($notifiable): MailMessage
    {
        // // IMPORTANT: Define FRONTEND_URL in your .env file
        // // Example: FRONTEND_URL=http://localhost:3000
        // $resetUrl = config('app.frontend_url', url('/')) // Fallback to backend url if not set
        //     . '/reset-password?token=' . $this->token
        //     . '&email=' . urlencode($notifiable->getEmailForPasswordReset()); // Include email if your frontend needs it

        // return (new MailMessage)
        //     ->subject(Lang::get('Reset Driver Password Notification'))
        //     ->line(Lang::get('You are receiving this email because we received a password reset request for your driver account.'))
        //     ->action(Lang::get('Reset Password'), $resetUrl)
        //     ->line(Lang::get('This password reset link will expire in :count minutes.', ['count' => config('auth.passwords.users.expire')])) // Assuming 'users' broker, adjust if using a custom one
        //     ->line(Lang::get('If you did not request a password reset, no further action is required.'));

        return (new MailMessage)
            ->subject(Lang::get('Reset Driver Password Notification'))
            ->line(Lang::get('You are receiving this email because we received a password reset request for your driver account.'))
            ->action(Lang::get('Reset Password'), url('/reset-password?token=' . $this->token))
            ->line(Lang::get('This password reset link will expire in :count minutes.', ['count' => config('auth.passwords.drivers.expire')])) // Assuming 'users' broker, adjust if using a custom one
            ->line(Lang::get('If you did not request a password reset, no further action is required.'));
    }

}