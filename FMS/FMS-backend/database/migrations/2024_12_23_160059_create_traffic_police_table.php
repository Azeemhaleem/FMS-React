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
        Schema::create('traffic_police', function (Blueprint $table) {
            $table->id();
            $table->foreignId('police_user_id')->constrained('police_users')->onDelete('cascade');
            $table->foreignId('police_in_dept_id')->constrained('police_in_depts')->onDelete('cascade');
            $table->boolean('in_service')->default(false);
            $table->string('service_region')->nullable();
            $table->softDeletes()->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('traffic_police');
    }
};
