<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HigherPoliceTrafficPolice extends Model
{
    protected $table = 'higher_traffic_police';

    protected $fillable = [
        'higher_police_id',
        'traffic_police_id',
        'assigned_at',
        'unassigned_at'
    ];
}
