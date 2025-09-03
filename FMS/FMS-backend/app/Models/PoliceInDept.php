<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

class PoliceInDept extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'police_id',
        'full_name' // Corrected from 'dept_id'
    ];

    public function admin()
    {
        return $this->hasOne(Admin::class, 'police_in_dept_id');
    }

    public function higherPolice()
    {
        return $this->hasOne(HigherPolice::class, 'police_in_dept_id');
    }

    public function trafficPolice()
    {
        return $this->hasOne(TrafficPolice::class, 'police_in_dept_id');
    }

    protected function policeUser(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->trafficPolice) {
                    return $this->trafficPolice->policeUser;
                }
                if ($this->higherPolice) {
                    return $this->higherPolice->policeUser;
                }
                if ($this->admin) {
                    return $this->admin->policeUser;
                }
                return null;
            }
        );
    }
}