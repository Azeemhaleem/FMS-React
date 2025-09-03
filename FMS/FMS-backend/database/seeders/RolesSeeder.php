<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

use App\Models\Roles;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([
            'name' => 'traffic_officer',
        ]);
        DB::table('roles')->insert([
            'name' => 'higher_officer',
        ]);
        DB::table('roles')->insert([
            'name' => 'admin',
        ]);
    }
}
