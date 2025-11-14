<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class driverInDept extends Model
{
    use SoftDeletes;

    protected static function getEmailbyId($id) {
        return driverInDept::where('id', $id)->first()->email;
    }

    public function driverUser()
    {
        return $this->hasOne(DriverUser::class, 'driver_in_dept_id');
    }
}
