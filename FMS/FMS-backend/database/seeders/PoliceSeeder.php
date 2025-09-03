<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

use App\Models\Roles;
use App\Models\PoliceInDept;
use App\Models\PoliceUser;
use App\Models\HigherPolice;
use App\Models\TrafficPolice;
use App\Models\Admin;
use App\Models\AccountCreationLog;
use App\Models\HigherPoliceTrafficPolice;

use Illuminate\Support\Facades\Hash;

class PoliceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('police_in_depts')->insert([
            'police_id' => '1111',
            'full_name' => 'Police 1',
        ]);
        DB::table('police_in_depts')->insert([
            'police_id' => '2222',
            'full_name' => 'Police 2',
        ]);
        DB::table('police_in_depts')->insert([
            'police_id' => '3333',
            'full_name' => 'Police 3',
        ]);
        DB::table('police_in_depts')->insert([
            'police_id' => '4444',
            'full_name' => 'Police 4',
        ]);
        DB::table('police_in_depts')->insert([
            'police_id' => '5555',
            'full_name' => 'Police 5',
        ]);
        DB::table('police_in_depts')->insert([
            'police_id' => '6666',
            'full_name' => 'Police 6',
        ]);
        DB::table('police_in_depts')->insert([
            'police_id' => '7777',
            'full_name' => 'Police 7',
        ]);
        DB::table('police_in_depts')->insert([
            'police_id' => '8888',
            'full_name' => 'Police 8',
        ]);
        DB::table('police_in_depts')->insert([
            'police_id' => '9999',
            'full_name' => 'Police 9',
        ]);
        DB::table('police_in_depts')->insert([
            'police_id' => '1010',
            'full_name' => 'Police 10',
        ]);

        DB::table('police_users')->insert([
            'username' => 'superadmin1',
            'password' => Hash::make('password'),
            'email' => 'superadmin1@email.com',
            'email_verified_at' => now(),
            'role_id' => Roles::where('name', 'admin')->first()->id,
        ]);
        DB::table('admins')->insert([
            'police_user_id' => PoliceUser::where('username', 'superadmin1')->first()->id,
            'police_in_dept_id' => PoliceInDept::where('police_id', '1111')->first()->id,
            'is_super_admin' => true,
        ]);
        AccountCreationLog::create([
            'created_by' => PoliceUser::where('username', 'superadmin1')->first()->id,
            'created_for' => PoliceUser::where('username', 'superadmin1')->first()->id,
        ]);

        DB::table('police_users')->insert([
            'username' => 'admin1',
            'password' => Hash::make('password'),
            'email' => 'admin1@email.com',
            'email_verified_at' => now(),
            'role_id' => Roles::where('name', 'admin')->first()->id,
        ]);
        DB::table('admins')->insert([
            'police_user_id' => PoliceUser::where('username', 'admin1')->first()->id,
            'police_in_dept_id' => PoliceInDept::where('police_id', '2222')->first()->id,
            'is_super_admin' => false,
        ]);
        AccountCreationLog::create([
            'created_by' => PoliceUser::where('username', 'superadmin1')->first()->id,
            'created_for' => PoliceUser::where('username', 'admin1')->first()->id,
        ]);

        DB::table('police_users')->insert([
            'username' => 'admin2',
            'password' => Hash::make('password'),
            'email' => 'admin2@email.com',
            'email_verified_at' => now(),
            'role_id' => Roles::where('name', 'admin')->first()->id,
        ]);
        DB::table('admins')->insert([
            'police_user_id' => PoliceUser::where('username', 'admin2')->first()->id,
            'police_in_dept_id' => PoliceInDept::where('police_id', '3333')->first()->id,
            'is_super_admin' => false,
        ]);
        AccountCreationLog::create([
            'created_by' => PoliceUser::where('username', 'superadmin1')->first()->id,
            'created_for' => PoliceUser::where('username', 'admin2')->first()->id,
        ]);

        DB::table('police_users')->insert([
            'username' => 'superadmin2',
            'password' => Hash::make('password'),
            'email' => 'superadmin2@email.com',
            'email_verified_at' => now(),
            'role_id' => Roles::where('name', 'admin')->first()->id,
        ]);
        DB::table('admins')->insert([
            'police_user_id' => PoliceUser::where('username', 'superadmin2')->first()->id,
            'police_in_dept_id' => PoliceInDept::where('police_id', '4444')->first()->id,
            'is_super_admin' => true,
        ]);
        AccountCreationLog::create([
            'created_by' => PoliceUser::where('username', 'superadmin1')->first()->id,
            'created_for' => PoliceUser::where('username', 'superadmin2')->first()->id,
        ]);

        DB::table('police_users')->insert([
            'username' => 'higherofficer1',
            'password' => Hash::make('password'),
            'email' => 'higherofficer1@email.com',
            'email_verified_at' => now(),
            'role_id' => Roles::where('name', 'higher_officer')->first()->id,
        ]);
        DB::table('higher_police')->insert([
            'police_user_id' => PoliceUser::where('username', 'higherofficer1')->first()->id,
            'police_in_dept_id' => PoliceInDept::where('police_id', '5555')->first()->id,
        ]);
        AccountCreationLog::create([
            'created_by' => PoliceUser::where('username', 'admin1')->first()->id,
            'created_for' => PoliceUser::where('username', 'higherofficer1')->first()->id,
        ]);

        DB::table('police_users')->insert([
            'username' => 'higherofficer2',
            'password' => Hash::make('password'),
            'email' => 'higherofficer2@email.com',
            'email_verified_at' => now(),
            'role_id' => Roles::where('name', 'higher_officer')->first()->id,
        ]);
        DB::table('higher_police')->insert([
            'police_user_id' => PoliceUser::where('username', 'higherofficer2')->first()->id,
            'police_in_dept_id' => PoliceInDept::where('police_id', '6666')->first()->id,
        ]);
        AccountCreationLog::create([
            'created_by' => PoliceUser::where('username', 'admin1')->first()->id,
            'created_for' => PoliceUser::where('username', 'higherofficer2')->first()->id,
        ]);

        DB::table('police_users')->insert([
            'username' => 'trafficpolice1',
            'password' => Hash::make('password'),
            'email' => 'trafficpolice1@email.com',
            'email_verified_at' => now(),
            'role_id' => Roles::where('name', 'traffic_officer')->first()->id,
        ]);
        DB::table('traffic_police')->insert([
            'police_user_id' => PoliceUser::where('username', 'trafficpolice1')->first()->id,
            'police_in_dept_id' => PoliceInDept::where('police_id', '7777')->first()->id,
        ]);
        DB::table('higher_traffic_police')->insert([
            'higher_police_id' => '6666',
            'traffic_police_id' => '7777',
        ]);
        AccountCreationLog::create([
            'created_by' => PoliceUser::where('username', 'admin2')->first()->id,
            'created_for' => PoliceUser::where('username', 'trafficpolice1')->first()->id,
        ]);

        DB::table('police_users')->insert([
            'username' => 'trafficpolice2',
            'password' => Hash::make('password'),
            'email' => 'trafficpolice2@email.com',
            'email_verified_at' => now(),
            'role_id' => Roles::where('name', 'traffic_officer')->first()->id,
        ]);
        DB::table('traffic_police')->insert([
            'police_user_id' => PoliceUser::where('username', 'trafficpolice2')->first()->id,
            'police_in_dept_id' => PoliceInDept::where('police_id', '8888')->first()->id,
        ]);
        DB::table('higher_traffic_police')->insert([
            'higher_police_id' => '6666',
            'traffic_police_id' => '8888',
        ]);
        AccountCreationLog::create([
            'created_by' => PoliceUser::where('username', 'admin2')->first()->id,
            'created_for' => PoliceUser::where('username', 'trafficpolice2')->first()->id,
        ]);

        DB::table('police_users')->insert([
            'username' => 'trafficpolice3',
            'password' => Hash::make('password'),
            'email' => 'trafficpolice3@email.com',
            'email_verified_at' => now(),
            'role_id' => Roles::where('name', 'traffic_officer')->first()->id,
        ]);
        DB::table('traffic_police')->insert([
            'police_user_id' => PoliceUser::where('username', 'trafficpolice3')->first()->id,
            'police_in_dept_id' => PoliceInDept::where('police_id', '9999')->first()->id,
        ]);
        DB::table('higher_traffic_police')->insert([
            'higher_police_id' => '5555',
            'traffic_police_id' => '9999',
        ]);
        AccountCreationLog::create([
            'created_by' => PoliceUser::where('username', 'admin1')->first()->id,
            'created_for' => PoliceUser::where('username', 'trafficpolice3')->first()->id,
        ]);
    }
}
