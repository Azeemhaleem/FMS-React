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
        Schema::create('fine_deleting_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('fine_id');
            $table->foreign('fine_id')->references('id')->on('charged_fines')->onDelete('cascade');
            $table->timestamp('asked_at')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->boolean('accepted')->default(false);
            $table->string('reason')->nullable();
            $table->foreignId('deleted_by')->constrained('police_users')->onDelete('cascade')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fine_deleting_requests');
    }
};
