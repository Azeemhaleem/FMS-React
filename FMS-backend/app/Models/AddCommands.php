<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AddCommands extends Model
{
    protected $fillable = [
        'name', 'nic', 'driver_license_number', 'email', 'message', 'status'
    ];
}


