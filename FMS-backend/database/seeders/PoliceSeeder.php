<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

use App\Models\Roles;
use App\Models\PoliceInDept;
use App\Models\PoliceUser;
use App\Models\HigherPolice;
use App\Models\TrafficPolice;
use App\Models\Admin;
use App\Models\AccountCreationLog;

class PoliceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ----------------------------
        // Insert Police in Departments
        // ----------------------------
        $policeDepts = [
            ['police_id' => 'BC11111', 'full_name' => 'Mohamed Azeem', 'p_station' => 'Kandy'],
            ['police_id' => 'BC11112', 'full_name' => 'Sandali Shela', 'p_station' => 'Matara'],
            ['police_id' => 'BC11113', 'full_name' => 'Rikaf Fasri', 'p_station' => 'Dehiwala'],
            ['police_id' => 'BC11114', 'full_name' => 'Sarasi Perera', 'p_station' => 'Colombo'],
            ['police_id' => 'BC11115', 'full_name' => 'Saman Kumara', 'p_station' => 'Kandy'],
            ['police_id' => 'BC11116', 'full_name' => 'Roshan Watawala', 'p_station' => 'Colombo'],
            ['police_id' => 'BC11117', 'full_name' => 'Saman Perera', 'p_station' => 'Kandy'],
            ['police_id' => 'BC11118', 'full_name' => 'Police 5', 'p_station' => 'Colombo'],
            ['police_id' => 'BC11119', 'full_name' => 'Police 6', 'p_station' => 'Colombo'],
            ['police_id' => 'BC11121', 'full_name' => 'Police 7', 'p_station' => 'Colombo'],
            ['police_id' => 'BC11122', 'full_name' => 'Police 8', 'p_station' => 'Colombo'],
            ['police_id' => 'BC11123', 'full_name' => 'Police 9', 'p_station' => 'Colombo'],
            ['police_id' => 'BC11124', 'full_name' => 'Police 10', 'p_station' => 'Colombo'],
            ['police_id' => '1011', 'full_name' => 'Police 11'],
            ['police_id' => '1012', 'full_name' => 'Police 12'],
            ['police_id' => '1013', 'full_name' => 'Police 13'],
            ['police_id' => '1014', 'full_name' => 'Police 14'],
            ['police_id' => '1015', 'full_name' => 'Police 15'],
        ];

        foreach ($policeDepts as $dept) {
            DB::table('police_in_depts')->insert($dept);
        }

        // ----------------------------
        // Users
        // ----------------------------
        $users = [
            // Super Admins
            ['username' => 'azeem1', 'full_name' => 'Mohamed Azeem', 'email' => 'azeem1@email.com', 'role' => 'admin', 'super_admin' => true, 'police_id' => 'BC11111'],
            ['username' => 'azeem2', 'full_name' => 'Mohamed Azeem 2', 'email' => 'azeem2@email.com', 'role' => 'admin', 'super_admin' => true, 'police_id' => '1011'],

            // Admins
            ['username' => 'sandali1', 'full_name' => 'Sandali Shela', 'email' => 'sandali1@email.com', 'role' => 'admin', 'super_admin' => false, 'police_id' => 'BC11112'],
            ['username' => 'sandali2', 'full_name' => 'Sandali Shela 2', 'email' => 'sandali2@email.com', 'role' => 'admin', 'super_admin' => false, 'police_id' => '1012'],

            // Higher Officers
            ['username' => 'sarasi1', 'full_name' => 'Sarasi Perera', 'email' => 'sarasi1@email.com', 'role' => 'higher_officer', 'police_id' => 'BC11114'],
            ['username' => 'sarasi2', 'full_name' => 'Sarasi Perera 2', 'email' => 'sarasi2@email.com', 'role' => 'higher_officer', 'police_id' => '1013'],

            // Traffic Officers
            ['username' => 'rikaf1', 'full_name' => 'Rikaf Fasri', 'email' => 'rikaf1@email.com', 'role' => 'traffic_officer', 'police_id' => 'BC11113'],
            ['username' => 'rikaf2', 'full_name' => 'Rikaf Fasri 2', 'email' => 'rikaf2@email.com', 'role' => 'traffic_officer', 'police_id' => '1014'],
        ];

        foreach ($users as $user) {
            // Insert into police_users
            DB::table('police_users')->insert([
                'username' => $user['username'],
                'password' => Hash::make('Password1@'),
                'email' => $user['email'],
                'email_verified_at' => now(),
                'role_id' => Roles::where('name', $user['role'])->first()->id,
            ]);

            $userId = PoliceUser::where('username', $user['username'])->first()->id;
            $deptId = PoliceInDept::where('police_id', $user['police_id'])->first()->id;

            if ($user['role'] === 'admin') {
                DB::table('admins')->insert([
                    'police_user_id' => $userId,
                    'police_in_dept_id' => $deptId,
                    'is_super_admin' => $user['super_admin'],
                ]);
            } elseif ($user['role'] === 'higher_officer') {
                DB::table('higher_police')->insert([
                    'police_user_id' => $userId,
                    'police_in_dept_id' => $deptId,
                ]);
            } elseif ($user['role'] === 'traffic_officer') {
                DB::table('traffic_police')->insert([
                    'police_user_id' => $userId,
                    'police_in_dept_id' => $deptId,
                ]);
            }

            AccountCreationLog::create([
                'created_by' => PoliceUser::where('username', 'azeem1')->first()->id, // assume azeem1 is creator
                'created_for' => $userId,
            ]);
        }

        // ----------------------------
        // Higher-Traffic Mapping
        // ----------------------------
        $higherTrafficMapping = [
            ['higher_police_id' => 'BC11114', 'traffic_police_id' => 'BC11113'], // sarasi1 -> rikaf1
            ['higher_police_id' => '1013', 'traffic_police_id' => '1014'], // sarasi2 -> rikaf2
        ];

        foreach ($higherTrafficMapping as $map) {
            DB::table('higher_traffic_police')->insert([
                'higher_police_id' => $map['higher_police_id'],
                'traffic_police_id' => $map['traffic_police_id'],
            ]);
        }
    }
}