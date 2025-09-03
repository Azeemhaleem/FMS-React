<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FineDeletingRequests extends Model
{
    protected $table = 'fine_deleting_requests';

    protected $fillable = [
        'fine_id',
        'asked_at',
        'deleted_at',
        'reason',
        'deleted_by',
    ];
}
