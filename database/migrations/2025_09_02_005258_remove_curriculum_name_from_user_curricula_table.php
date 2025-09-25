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
        Schema::table('user_curricula', function (Blueprint $table) {
            $table->dropColumn('curriculum_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_curricula', function (Blueprint $table) {
            $table->string('curriculum_name')->after('user_id');
        });
    }
};
