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
        Schema::create('account_creation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('police_users')->onDelete('cascade');
            $table->foreignId('created_for')->constrained('police_users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_creation_logs');
    }
};
