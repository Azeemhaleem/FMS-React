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
        Schema::create('higher_traffic_police', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('higher_police_id');
            $table->unsignedBigInteger('traffic_police_id');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('unassigned_at')->nullable();
            $table->unique(['higher_police_id', 'traffic_police_id']);
            $table->timestamps();

            $table->foreign('higher_police_id')->references('police_id')->on('police_in_depts')->onDelete('cascade');
            $table->foreign('traffic_police_id')->references('police_id')->on('police_in_depts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('higher_traffic_police');
    }
};