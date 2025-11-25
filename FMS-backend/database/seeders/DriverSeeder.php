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
            'full_name' => 'Sanjaya Perera',
            'email' => 'driver1@email.com',
            'licence_id_no' => 'BC112555',
        ]);
        DB::table('driver_in_depts')->insert([
            'license_no' => '2222',
            'full_name' => 'Sandali Shela',
            'email' => 'driver2@email.com',
            'licence_id_no' => 'BC112556',
        ]);
        DB::table('driver_in_depts')->insert([
            'license_no' => '3333',
            'full_name' => 'Mohamed Rikaf',
            'email' => 'driver3@email.com',
            'licence_id_no' => 'BC112557',
        ]);
        DB::table('driver_in_depts')->insert([
            'license_no' => '4444',
            'full_name' => 'John Doe',
            'email' => 'driver4@email.com',
            'licence_id_no' => 'BC112558',
        ]);
        DB::table('driver_in_depts')->insert([
            'license_no' => '30005840626XUGYXSKEP',
            'full_name' => 'Mohamed Azeem',
            'email' => 'azeemhaleem451@gmail.com',
            'licence_id_no' => 'BC937578',
            'issued_issued_date' => '17.11.2022',
            'license_expiry_date' => '17.11.2030'
        ]);

        DB::table('driver_users')->insert([
            'driver_in_dept_id' => DriverInDept::where('license_no', '1111')->first()->id,
            'username' => 'sanjaya1',
            'password' => Hash::make('Password1@'),
            'email_verified_at' => now(),
        ]);
        DB::table('driver_users')->insert([
            'driver_in_dept_id' => DriverInDept::where('license_no', '2222')->first()->id,
            'username' => 'shela1',
            'password' => Hash::make('Password1@'),
            'email_verified_at' => now(),
        ]);
        // DB::table('driver_users')->insert([
        //     'driver_in_dept_id' => DriverInDept::where('license_no', '3333')->first()->id,
        //     'username' => 'driver3',
        //     'password' => Hash::make('Password1@'),
        //     'email_verified_at' => now(),
        // ]);
        // DB::table('driver_users')->insert([
        //     'driver_in_dept_id' => DriverInDept::where('license_no', '4444')->first()->id,
        //     'username' => 'driver4',
        //     'password' => Hash::make('Password1@'),
        //     'email_verified_at' => now(),
        // ]);
    }
}