<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fine extends Model
{
    use SoftDeletes;

    protected $table = 'fines';

    protected $fillable = [
        'name',
        'amount',
        'description',
    ];

    public function chargedInstances()
    {
        return $this->hasMany(ChargedFine::class, 'fine_id');
    }
}
