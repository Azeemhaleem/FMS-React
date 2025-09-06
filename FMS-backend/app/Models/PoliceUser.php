<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Auth\Passwords\CanResetPassword;
use App\Notifications\Police\PoliceResetPasswordNotification;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Services\PoliceHierarchyService;

class PoliceUser extends Model implements CanResetPasswordContract
{
    use HasApiTokens, SoftDeletes, Notifiable, CanResetPassword;

    protected $fillable = [
        'username',
        'email',
        'password',
        'role_id',
        'receives_email_notifications',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'receives_email_notifications' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    public function role()
    {
        return $this->belongsTo(Roles::class, 'role_id');
    }

    public function admin()
    {
        return $this->hasOne(Admin::class, 'police_user_id');
    }

    public function higherPolice()
    {
        return $this->hasOne(HigherPolice::class, 'police_user_id');
    }

    public function trafficPolice()
    {
        return $this->hasOne(TrafficPolice::class, 'police_user_id');
    }
    
    public function issuedFines()
    {
        return $this->hasMany(ChargedFine::class, 'police_user_id');
    }

    protected function roleName(): Attribute
    {
        return Attribute::make(
            get: function () {
                $roleName = $this->role->name;
                if ($roleName === 'admin' && $this->admin?->is_super_admin) {
                    return 'super_admin';
                }
                return $roleName;
            }
        );
    }

    protected function policeInDept(): Attribute
    {
        return Attribute::make(
            get: function () {
                $this->loadMissing('role'); 
                
                switch ($this->role->name) {
                    case 'admin':
                        return $this->admin?->policeInDept;
                    case 'traffic_officer':
                        return $this->trafficPolice?->policeInDept;
                    case 'higher_officer':
                        return $this->higherPolice?->policeInDept;
                    default:
                        return null;
                }
            }
        );
    }

    public function routeNotificationForMail($notification)
    {
        return $this->receives_email_notifications ? $this->email : null;
    }

    public function getEmailForPasswordReset()
    {
        return $this->email;
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new PoliceResetPasswordNotification($token, $this->getEmailForPasswordReset()));
    }

    protected function station(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->higherPolice) {
                    return $this->higherPolice->station;
                }
                if ($this->trafficPolice) {
                    return optional(
                        resolve(\App\Services\PoliceHierarchyService::class)
                            ->getAssignedHigherOfficer($this)
                    )->station;
                }
                return null;
            }
        );
    }
}