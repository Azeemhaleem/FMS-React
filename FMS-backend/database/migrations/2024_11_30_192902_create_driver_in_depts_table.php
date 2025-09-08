<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    public function up(): void
    {
        Schema::create('driver_in_depts', function (Blueprint $table) {
            $table->id();
            $table->string('license_no')->unique();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('licence_id_no')->nullable()->unique();
            $table->date('issued_issued_date')->nullable();
            $table->date('license_expiry_date')->nullable();
            $table->softDeletes()->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_in_depts');
    }
};
