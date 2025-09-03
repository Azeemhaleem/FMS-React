<?php

namespace App\Notifications\Police;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;


class PoliceResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $token;
    public $email;
    /**
     * Create a new notification instance.
     */
    public function __construct($token, $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    public static $toMailCallback;

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        if (static::$toMailCallback) {
            return call_user_func(static::$toMailCallback, $notifiable, $this->token);
        }

        // *** IMPORTANT: Frontend URL Construction ***
        // Get your frontend URL from config or .env
        // The frontend route might look like: /police/reset-password
        // It needs the token and email as query parameters.
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000'); // Example: Get from config or .env
        $resetUrl = $frontendUrl . '/police/reset-password?token=' . $this->token . '&email=' . urlencode($this->email);

        return (new MailMessage)
            ->subject(Lang::get('Reset Police Account Password'))
            ->line(Lang::get('You are receiving this email because we received a password reset request for your police account.'))
            ->line(Lang::get('Please click the button below to reset your password:'))
            ->action(Lang::get('Reset Password'), $resetUrl) // Link to your FRONTEND reset page
            ->line(Lang::get('This password reset link will expire in :count minutes.', ['count' => config('auth.passwords.polices.expire', 60)]))
            ->line(Lang::get('Your reset token is: :token', ['token' => $this->token]))
            ->line(Lang::get('If you did not request a password reset, no further action is required.'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
