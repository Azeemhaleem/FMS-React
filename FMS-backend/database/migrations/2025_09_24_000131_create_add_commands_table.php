<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    
        Schema::create('add_commands', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('nic', 20)->index();                 // e.g., 200112345678 or 991234567V
            $table->string('driver_license_number', 30)->nullable();
            $table->string('email', 190);
            $table->text('message')->nullable();
            $table->string('status', 20)->default('new');       // new | seen | replied
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('add_commands');
    }
};
