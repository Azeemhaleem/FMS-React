<?php

namespace App\Http\Controllers\sAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Fine;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ManageFinesController extends Controller
{
    public function addFinesToTable(Request $request) {
        $request->validate([
            'name' => 'bail|required|unique:fines,name|string|max:50',
            'amount' => 'bail|required|numeric',
            'description' => 'bail|required|string|max:255',
        ]);

        $fine = Fine::create([
            'name' => $request->name,
            'amount' => $request->amount,
            'description' => $request->description,
        ]);

        if (!$fine) {
            return response()->json([
                'message' => 'Failed to add fine'
            ], 500);
        }

        return response()->json([
            'message' => 'Fine added successfully', // Add a success message
            'fine' => $fine
        ], 201);
    }

    public function updateFine(Request $request) {
        $validator = Validator::make($request->all(), [
            'fine_id'   => 'bail|required|integer|exists:fines,id',
            'name'      => [
                'bail',
                'nullable',
                'string',
                'max:50',
                Rule::unique('fines', 'name')->ignore($request->fine_id),
            ],
            'amount'    => 'bail|nullable|numeric',
            'description' => 'bail|nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $fine = Fine::findOrFail($request->fine_id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Fine not found'], 404);
        }


        $updateData = [];
        $validatedData = $validator->validated(); // Get validated data

        if (array_key_exists('name', $validatedData) && $validatedData['name'] !== null) {
            $updateData['name'] = $validatedData['name'];
        }
        if (array_key_exists('amount', $validatedData) && $validatedData['amount'] !== null) {
            $updateData['amount'] = $validatedData['amount'];
        }
        if (array_key_exists('description', $validatedData) && $validatedData['description'] !== null) {
            $updateData['description'] = $validatedData['description'];
        }

        if (!empty($updateData)) {
            try {
                $fine->update($updateData);
            } catch (\Exception $e) {
                return response()->json([
                'message' => 'Failed to update fine'
                ], 500);
            }
        } else {
            return response()->json([
                'message' => 'No update data provided',
                'fine' => $fine
            ], 200);
        }

        return response()->json([
            'message' => 'Fine updated successfully',
            'fine' => $fine->fresh()
        ], 200);
    }


    public function deleteFine(Request $request) {
        $request->validate([
            'fine_id' => 'bail|required|integer|exists:fines,id',
        ]);

        try {
            $fine = Fine::findOrFail($request->fine_id);
            $fine->delete();

            return response()->json([
                'message' => 'Deleted fine successfully'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Fine not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete fine'], 500);
        }
    }

    public function getFineById(Request $request) {
        $request->validate([
            'fine_id' => 'bail|required|integer|exists:fines,id',
        ]);

        $fine = Fine::findOrFail($request->fine_id);

        return response()->json([
            'fine' => $fine
        ], 200);
    }

    public function getAllFines() {
        $fines = Fine::all();

        return response()->json([
            'fines' => $fines
        ], 200);
    }
}
