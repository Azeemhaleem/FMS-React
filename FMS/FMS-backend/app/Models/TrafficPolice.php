<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrafficPolice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'police_user_id',
        'police_in_dept_id',
        'in_service',
    ];

    protected $casts = [
        'in_service' => 'boolean',
    ];

    public function policeUser()
    {
        return $this->belongsTo(PoliceUser::class, 'police_user_id');
    }

    public function policeInDept()
    {
        return $this->belongsTo(PoliceInDept::class, 'police_in_dept_id');
    }
}