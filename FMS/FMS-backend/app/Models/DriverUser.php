<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Auth\Passwords\CanResetPassword;
use App\Notifications\DriverResetPasswordNotification;

use App\Models\driverInDept;
use App\Models\ChargedFine;

class DriverUser extends Model implements CanResetPasswordContract
{
    use HasApiTokens, SoftDeletes, Notifiable, CanResetPassword;

    protected $fillable = [
        'driver_in_dept_id',
        'username',
        'password',
        'receives_email_notifications'
    ];

    protected $hidden = [
        'password'
    ];

    protected $casts = [
        'receives_email_notifications' => 'boolean',
        'email_verified_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    public function driverInDept() {
        return $this->belongsTo(driverInDept::class, 'driver_in_dept_id');
    }

    public function getEmailForPasswordReset(): string
    {
         $driverInfo = $this->driverInDept()->first();
         return $driverInfo ? $driverInfo->email : '';
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new DriverResetPasswordNotification($token));
    }

    public function routeNotificationForMail($notification): string
    { 
        if ($this->receives_email_notifications) {
            return $this->getEmailForPasswordReset();
        }

        return null;
    }

    public function chargedFines()
    {
        return $this->hasMany(ChargedFine::class, 'driver_user_id');
    }
}
