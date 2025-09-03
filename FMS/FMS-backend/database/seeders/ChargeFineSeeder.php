<?php

// namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
// use Illuminate\Database\Seeder;

// use App\Models\Fine;
// use App\Models\DriverUser;
// use App\Models\PoliceUser;
// use App\Models\ChargedFine;

// use Illuminate\Support\Facades\DB;

// class ChargeFineSeeder extends Seeder
// {
//     /**
//      * Run the database seeds.
//      */
//     public function run(): void
//     {
//         DB::table('charged_fines')->insert([
//             'fine_id' => Fine::where('name', 'fine 1')->first()->id,
//             'police_user_id' => PoliceUser::where('username', 'trafficpolice1')->first()->id,
//             'driver_user_id' => DriverUser::where('username', 'driver1')->first()->id,
//             'issued_at' => now(),
//             'expires_at' => now()->addDays(14)
//         ]);
//         DB::table('charged_fines')->insert([
//             'fine_id' => Fine::where('name', 'fine 3')->first()->id,
//             'police_user_id' => PoliceUser::where('username', 'trafficpolice3')->first()->id,
//             'driver_user_id' => DriverUser::where('username', 'driver3')->first()->id,
//             'issued_at' => now(),
//             'expires_at' => now()->addDays(14)
//         ]);
//         DB::table('charged_fines')->insert([
//             'fine_id' => Fine::where('name', 'fine 2')->first()->id,
//             'police_user_id' => PoliceUser::where('username', 'trafficpolice2')->first()->id,
//             'driver_user_id' => DriverUser::where('username', 'driver1')->first()->id,
//             'issued_at' => now(),
//             'expires_at' => now()->addDays(14)
//         ]);
//         DB::table('charged_fines')->insert([
//             'fine_id' => Fine::where('name', 'fine 2')->first()->id,
//             'police_user_id' => PoliceUser::where('username', 'trafficpolice3')->first()->id,
//             'driver_user_id' => DriverUser::where('username', 'driver2')->first()->id,
//             'issued_at' => now(),
//             'expires_at' => now()->addDays(14)
//         ]);
//     }
// }

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Fine;
use App\Models\DriverUser;
use App\Models\PoliceUser;
use Illuminate\Support\Facades\DB;
use App\Models\ChargedFine;
use Carbon\Carbon;

class ChargeFineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ChargedFine::truncate();

        // Pre-fetch all required IDs and convert to arrays
        $fineIds = Fine::pluck('id', 'name')->toArray();
        // $policeUsers = PoliceUser::whereIn('id', [7, 8, 9])->get();
        $policeUsers = PoliceUser::where('role_id', 1)->get();
        $policeUserIds = $policeUsers->pluck('id', 'username')->toArray();
        $driverUserIds = DriverUser::pluck('id', 'username')->toArray();
        
        // Define available entities as arrays
        $fines = array_keys($fineIds);
        $policeUsers = array_keys($policeUserIds);
        $driverUsers = array_keys($driverUserIds);
        
        // Generate 15 diverse charged fine records
        $records = [];
        for ($i = 0; $i < 30; $i++) {
            // Randomly select entities
            $fine = $fines[array_rand($fines)];
            $police = $policeUsers[array_rand($policeUsers)];
            $driver = $driverUsers[array_rand($driverUsers)];
            
            // Generate random issue date (within last 180 days)
            $issuedAt = Carbon::now()->subDays(rand(0, 180));
            $expiresAt = $issuedAt->copy()->addDays(14);
            
            // Initialize default values
            $paidAt = null;
            $deletedAt = null;
            $pendingDelete = false;
            $appealRequested = false;
            
            // Determine the state of the fine
            $isExpired = $expiresAt->isPast();
            
            if ($isExpired) {
                // For expired fines, randomly choose a resolution
                $resolution = rand(1, 3);
                
                switch ($resolution) {
                    case 1: // Driver appealed and was accepted
                        $appealRequested = true;
                        $deletedAt = $expiresAt->copy()->addDays(rand(1, 30));
                        break;
                        
                    case 2: // Police requested deletion
                        $pendingDelete = true;
                        $deletedAt = $expiresAt->copy()->addDays(rand(1, 30));
                        break;
                        
                    case 3: // Expired with no action
                        // Keep all values as default (null)
                        break;
                }
            } else {
                // For non-expired fines, randomly decide if paid
                if (rand(1, 2) === 1) {
                    // Paid before expiry
                    $paidAt = $issuedAt->copy()->addDays(rand(1, 13));
                }
            }
            
            // Create record
            $records[] = [
                'fine_id' => $fineIds[$fine],
                'police_user_id' => $policeUserIds[$police],
                'driver_user_id' => $driverUserIds[$driver],
                'issued_at' => $issuedAt,
                'expires_at' => $expiresAt,
                'paid_at' => $paidAt,
                'pending_delete' => $pendingDelete,
                'appeal_requested' => $appealRequested,
                'deleted_at' => $deletedAt,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        // Insert all records at once
        DB::table('charged_fines')->insert($records);
    }
}