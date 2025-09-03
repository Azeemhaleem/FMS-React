<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FineAppealRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'fine_id',
        'asked_at',
        'reason'
    ];

    protected $casts = [
        'asked_at' => 'datetime',
    ];

    public function chargedFine()
    {
        return $this->belongsTo(ChargedFine::class, 'fine_id');
    }
}
