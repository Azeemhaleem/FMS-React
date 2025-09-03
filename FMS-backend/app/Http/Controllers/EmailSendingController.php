<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailSendingController extends Controller
{
    public static function sendEmail($address, $subject, $message) {
        Mail::raw($message, function ($message) use ($address, $subject) {
            $message->to($address)->subject($subject);
        });
    }
}