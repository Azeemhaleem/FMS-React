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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('stripe_payment_intent_id')->unique();
            $table->foreignId('driver_user_id')->constrained('driver_users')->onDelete('cascade');
            $table->json('charged_fine_ids'); // Array of charged_fine IDs from charged_fines table
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('LKR');
            $table->string('status')->default('pending'); // pending, processing, succeeded, failed, canceled
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            $table->index('driver_user_id');
            $table->index('status');
            $table->index('stripe_payment_intent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};