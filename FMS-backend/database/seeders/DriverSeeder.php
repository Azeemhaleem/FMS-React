<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

use App\Models\driverInDept;
use App\Models\DriverUser;

use Illuminate\Support\Facades\Hash;

class DriverSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('driver_in_depts')->insert([
            'license_no' => '1111',
            'full_name' => 'Driver 1',
            'email' => 'driver1@email.com',
            'licence_id_no' => 'BC112555',
        ]);
        DB::table('driver_in_depts')->insert([
            'license_no' => '2222',
            'full_name' => 'Driver 2',
            'email' => 'driver2@email.com',
            'licence_id_no' => 'BC112556',
        ]);
        DB::table('driver_in_depts')->insert([
            'license_no' => '3333',
            'full_name' => 'Driver 3',
            'email' => 'driver3@email.com',
            'licence_id_no' => 'BC112557',
        ]);
        DB::table('driver_in_depts')->insert([
            'license_no' => '4444',
            'full_name' => 'Driver 4',
            'email' => 'driver4@email.com',
            'licence_id_no' => 'BC112558',
        ]);
        DB::table('driver_in_depts')->insert([
            'license_no' => '30005840626XUGYXSKEP',
            'full_name' => 'Siyas',
            'email' => 'siyas@email.com',
            'licence_id_no' => 'BC937578',
        ]);

        DB::table('driver_users')->insert([
            'driver_in_dept_id' => DriverInDept::where('license_no', '1111')->first()->id,
            'username' => 'driver1',
            'password' => Hash::make('Password1@'),
            'email_verified_at' => now(),
        ]);
        DB::table('driver_users')->insert([
            'driver_in_dept_id' => DriverInDept::where('license_no', '2222')->first()->id,
            'username' => 'driver2',
            'password' => Hash::make('Password1@'),
            'email_verified_at' => now(),
        ]);
        DB::table('driver_users')->insert([
            'driver_in_dept_id' => DriverInDept::where('license_no', '3333')->first()->id,
            'username' => 'driver3',
            'password' => Hash::make('Password1@'),
            'email_verified_at' => now(),
        ]);
        DB::table('driver_users')->insert([
            'driver_in_dept_id' => DriverInDept::where('license_no', '4444')->first()->id,
            'username' => 'driver4',
            'password' => Hash::make('Password1@'),
            'email_verified_at' => now(),
        ]);
    }
}
