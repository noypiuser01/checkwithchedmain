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
        Schema::table('curricula', function (Blueprint $table) {
            if (!Schema::hasColumn('curricula', 'program_name')) {
                $table->string('program_name', 255)->after('curriculum_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('curricula', function (Blueprint $table) {
            if (Schema::hasColumn('curricula', 'program_name')) {
                $table->dropColumn('program_name');
            }
        });
    }
};
