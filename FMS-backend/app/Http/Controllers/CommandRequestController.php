<?php

namespace App\Http\Controllers;


use App\Http\Requests\StoreCommandInfo;
use App\Models\AddCommands;

class CommandRequestController extends Controller
{
    public function create()
    {
        return view('contact.form'); // your Blade with the fields
    }

    public function store(StoreCommandInfo $request)
    {
        AddCommands::create($request->validated());

        return back()->with('success', 'Thanks! Your request was received.');
    }
}




