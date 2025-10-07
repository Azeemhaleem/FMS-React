<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;


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
        'appeal_requested',  
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $appends = ['can_pay', 'deadline_at_iso'];

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

    /**
     * Relationship to payment (if this charged fine is part of a payment)
     * This will find payments where this charged fine ID is in the charged_fine_ids array
     */
    public function payments()
    {
        return Payment::whereJsonContains('charged_fine_ids', $this->id);
    }

    public function paymentDeadline(): ?Carbon
    {
        if ($this->expires_at) return Carbon::parse($this->expires_at);
        if ($this->issued_at)  return Carbon::parse($this->issued_at)->addDays(14);
        return null;
    }
    public function isPayable(): bool
    {
        if ($this->paid_at) return false;
        if (!empty($this->appeal_requested)) return false;
        if (!empty($this->pending_delete))   return false;

        $deadline = $this->paymentDeadline();
        return $deadline ? now()->lt($deadline->endOfDay()) : true;
    }
    public function getCanPayAttribute(): bool
    {
        return $this->isPayable();
    }

    public function getDeadlineAtIsoAttribute(): ?string
    {
        return optional($this->paymentDeadline())->toIso8601String();
    }

}