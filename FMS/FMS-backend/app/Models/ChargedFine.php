<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Fine;
use App\Models\PoliceUser;
use App\Models\FineAppealRequest;

class ChargedFine extends Model
{
    use SoftDeletes;

    protected $table = 'charged_fines';

    protected $fillable = [
        'fine_id',
        'driver_user_id',
        'police_user_id',
        'paid_at',
        'expires_at',
        'issued_at',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function driverUser()
    {
        return $this->belongsTo(DriverUser::class, 'driver_user_id');
    }

    public function fine()
    {
        return $this->belongsTo(Fine::class, 'fine_id');
    }

    public function isExpired() {
        return $this->expires_at < now();
    }

    public function isPaid() {
        return $this->paid_at != null;
    }

    public function issuingPoliceOfficer()
    {
        return $this->belongsTo(PoliceUser::class, 'police_user_id');
    }

    public function appealRequest()
    {
        return $this->hasOne(FineAppealRequest::class, 'fine_id');
    }
}
