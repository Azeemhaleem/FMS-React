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
        Schema::create('driver_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_in_dept_id')->constrained('driver_in_depts');
            $table->string('username')->unique();
            $table->string('password');
            $table->string('profile_image_path')->nullable();
            $table->boolean('receives_email_notifications')->default(true);
            $table->timestamp('email_verified_at')->nullable()->default(null);
            $table->softDeletes()->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_users');
    }
};
