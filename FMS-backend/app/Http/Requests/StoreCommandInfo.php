<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommandInfo extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                   => ['required','string','max:120'],
            // Sri Lanka NIC: 9 digits + V/X (old) OR 12 digits (new)
            'nic'                    => ['required','regex:/^(\d{9}[VvXx]|\d{12})$/'],
            'driver_license_number'  => ['nullable','string','max:30'],
            'email'                  => ['required','email','max:190'],
            'message'                => ['nullable','string','max:2000'],
        ];
    }
}
