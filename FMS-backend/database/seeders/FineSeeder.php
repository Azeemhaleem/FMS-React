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
            'name' => 'No Revenue Licence Displayed',
            'amount' => 1000,
            'description' => 'Vehicle did not display a valid revenue licence when required.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Invalid Revenue Licence Use',
            'amount' => 1000,
            'description' => 'Driving a vehicle without a proper or valid revenue licence.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Unauthorized Driving of Emergency/Public Service Vehicle',
            'amount' => 1000,
            'description' => 'Driving an ambulance, police, or public service vehicle without special authorization.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Special Purpose Vehicle Without Licence',
            'amount' => 1000,
            'description' => 'Operating vehicles like tractors, cranes, or construction machines without the required licence.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Unauthorized Driving of Hazardous Load Vehicle',
            'amount' => 1000,
            'description' => 'Driving a vehicle carrying chemicals or hazardous waste without authorization.'
        ]);
        DB::table('fines')->insert([
            'name' => 'No Proper Driving Licence for Vehicle Class',
            'amount' => 1000,
            'description' => 'Driving a vehicle without the correct class of licence (e.g., heavy vehicle with only light licence).'
        ]);
        DB::table('fines')->insert([
            'name' => 'Driving Without Carrying Licence',
            'amount' => 1000,
            'description' => 'Not carrying a driving licence while operating a vehicle.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Unlicensed Driving Instructor',
            'amount' => 2000,
            'description' => 'Teaching someone to drive without having an instructor’s licence.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Exceeding Speed Limit',
            'amount' => 3000,
            'description' => 'Driving above the legal speed limit on roads.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Disobeying Road Rules',
            'amount' => 2000,
            'description' => 'Failing to follow general traffic and road rules.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Loss of Vehicle Control While Driving',
            'amount' => 1000,
            'description' => 'Not maintaining proper control of the vehicle while on the road.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Improper Use of Signals',
            'amount' => 1000,
            'description' => 'Using wrong or misleading vehicle signals when driving.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Reversing Vehicle Excessively',
            'amount' => 100,
            'description' => 'Reversing a vehicle for an unsafe or long distance on a road.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Misuse of Vehicle Warning Instruments',
            'amount' => 1000,
            'description' => 'Improper use of horns or other warning devices.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Excessive Smoke Emission',
            'amount' => 1000,
            'description' => 'Releasing harmful or thick smoke from the vehicle’s exhaust.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Riding on Running Boards',
            'amount' => 500,
            'description' => 'Allowing passengers to travel on the outside parts of a moving vehicle.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Exceeding Front Seat Capacity',
            'amount' => 1000,
            'description' => 'Carrying more passengers in the front seat than allowed.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Not Wearing Seat Belts',
            'amount' => 1000,
            'description' => 'Failing to wear a seat belt while driving or riding in a vehicle.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Not Wearing Helmet',
            'amount' => 1000,
            'description' => 'Riding a motorcycle or scooter without a helmet.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Distributing Ads From Moving Vehicle',
            'amount' => 1000,
            'description' => 'Throwing or handing out advertisements while the vehicle is moving.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Excessive Vehicle Noise',
            'amount' => 1000,
            'description' => 'Making loud or unnecessary noise using the vehicle (horns, engine, etc.).'
        ]);
        DB::table('fines')->insert([
            'name' => 'Ignoring Police Directions/Signals',
            'amount' => 2000,
            'description' => 'Not following instructions or signals given by police officers on duty.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Disobeying Traffic Signs',
            'amount' => 1000,
            'description' => 'Failing to comply with road traffic signs and signals.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Unsafe Refueling Practices',
            'amount' => 1000,
            'description' => 'Not taking proper safety precautions when refueling a vehicle.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Illegal Parking/Stoppage',
            'amount' => 1000,
            'description' => 'Stopping or parking a vehicle in prohibited areas.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Unsafe Parking or Leaving Vehicle Unattended',
            'amount' => 2000,
            'description' => 'Leaving a vehicle without precautions (e.g., on slopes, busy roads, or disabled condition).'
        ]);
        DB::table('fines')->insert([
            'name' => 'Excess Passengers/Goods in Private Cars/Coaches',
            'amount' => 500,
            'description' => 'Carrying more people or goods than allowed in private cars or coaches.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Excess Passengers/Goods in Omnibus',
            'amount' => 500,
            'description' => 'Carrying passengers or goods above the authorized limit in buses.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Excess Load in Lorry/Tricycle Van',
            'amount' => 500,
            'description' => 'Carrying goods beyond the maximum load limit of a lorry or trishaw van.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Excess Passengers in Lorry',
            'amount' => 500,
            'description' => 'Carrying more passengers than permitted in a lorry.'
        ]);
        DB::table('fines')->insert([
            'name' => 'Violation of Regulations',
            'amount' => 1000,
            'description' => 'Breaking other traffic regulations under the Motor Traffic Act.'
        ]);
        DB::table('fines')->insert([
            'name' => 'No Emission/Fitness Certificate Carried',
            'amount' => 500,
            'description' => 'Not having the vehicle emission certificate or fitness certificate when driving.'
        ]);
    }
}
