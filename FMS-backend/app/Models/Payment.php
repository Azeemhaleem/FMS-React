<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'stripe_payment_intent_id',
        'driver_user_id',
        'charged_fine_ids',
        'amount',
        'currency',
        'status',
        'paid_at'
    ];

    protected $casts = [
        'charged_fine_ids' => 'array',
        'paid_at' => 'datetime',
    ];

    /**
     * Relationship to driver user
     */
    public function driver()
    {
        return $this->belongsTo(DriverUser::class, 'driver_user_id');
    }

    /**
     * Relationship to charged fines (via the charged_fine_ids array)
     */
    public function chargedFines()
    {
        return ChargedFine::whereIn('id', $this->charged_fine_ids ?? []);
    }

    /**
     * Mark associated charged fines as paid
     */
    public function markFinesAsPaid()
    {
        ChargedFine::whereIn('id', $this->charged_fine_ids)
                  ->update(['paid_at' => now()]);
    }
}