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

        // match police_in_depts.police_id (varchar)
        $table->string('higher_police_id');
        $table->string('traffic_police_id');

        $table->timestamp('assigned_at')->nullable();
        $table->timestamp('unassigned_at')->nullable();
        $table->timestamps();

        // lookups
        $table->index('higher_police_id');
        $table->index('traffic_police_id');

        // one active assignment per traffic officer
        $table->unique(['traffic_police_id', 'unassigned_at'], 'uniq_active_traffic');

        $table->foreign('higher_police_id')
            ->references('police_id')->on('police_in_depts')->cascadeOnDelete();
        $table->foreign('traffic_police_id')
            ->references('police_id')->on('police_in_depts')->cascadeOnDelete();
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