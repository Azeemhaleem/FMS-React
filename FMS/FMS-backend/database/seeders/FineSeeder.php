<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;
use App\Models\Fine;

class FineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('fines')->insert([
            'name' => 'fine 1',
            'amount' => 100,
            'description' => 'fine 1 description'
        ]);
        DB::table('fines')->insert([
            'name' => 'fine 2',
            'amount' => 200,
            'description' => 'fine 2 description'
        ]);
        DB::table('fines')->insert([
            'name' => 'fine 3',
            'amount' => 300,
            'description' => 'fine 3 description'
        ]);
    }
}
