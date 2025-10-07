<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('charged_fines', function (Blueprint $t) {
            $t->timestamp('payment_closed_notified_at')->nullable()->after('paid_at');
        });
    }
    public function down(): void {
        Schema::table('charged_fines', function (Blueprint $t) {
            $t->dropColumn('payment_closed_notified_at');
        });
    }
};
