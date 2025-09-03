<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\SuperAdminSeeder;
use Database\Seeders\DriverSeeder;
use Database\Seeders\PoliceSeeder;
use Database\Seeders\RolesSeeder;
use Database\Seeders\FineSeeder;
use Database\Seeders\ChargeFineSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call([
            DriverSeeder::class,
            RolesSeeder::class,
            PoliceSeeder::class,
            FineSeeder::class,
            ChargeFineSeeder::class,
        ]);
    }
}
