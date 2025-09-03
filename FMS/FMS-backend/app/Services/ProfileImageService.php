<?php

namespace App\Services;

use Illuminate\Http\Request;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProfileImageService
{
    public function uploadImage(Request $request)
    {
        $validated = $request->validate([
            'image' => 'bail|required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $fileName = Str::Uuid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('profile_images', $fileName, 'public');
        
            if ($user->profile_image_path != null) {
                Storage::disk('public')->delete($user->profile_image_path);
            }

            $user->profile_image_path = $path;
            $user->save();

            return response()->json([
                'message' => 'Image uploaded successfully',
                'path' => Storage::url($path),
            ], 200);
        }

        return response()->json([
            'message' => 'No provided image',
        ], 400);
    }
}