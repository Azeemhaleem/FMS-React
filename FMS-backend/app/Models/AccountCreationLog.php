<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountCreationLog extends Model
{
    protected $table = 'account_creation_logs';

    protected $fillable = [
        'created_by',
        'created_for',
    ];

    public function created_by() {
        return $this->belongsTo(PoliceUser::class, 'created_by');
    }

    public function created_for() {
        return $this->belongsTo(PoliceUser::class, 'created_for');
    }
}
