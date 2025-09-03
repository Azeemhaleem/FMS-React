<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Admin extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'police_user_id',
        'police_in_dept_id',
        'is_super_admin',
    ];

    protected $casts = [
        'is_super_admin' => 'boolean',
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