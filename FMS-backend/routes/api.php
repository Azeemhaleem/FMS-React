<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


require base_path('routes/driver/driverAuth.php');
require base_path('routes/police/policeAuth.php');
