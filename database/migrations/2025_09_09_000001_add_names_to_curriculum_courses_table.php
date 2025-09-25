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
        Schema::table('curriculum_courses', function (Blueprint $table) {
            if (!Schema::hasColumn('curriculum_courses', 'curriculum_name')) {
                $table->string('curriculum_name', 255)->nullable()->after('curriculum_id');
            }
            if (!Schema::hasColumn('curriculum_courses', 'program_name')) {
                $table->string('program_name', 255)->nullable()->after('curriculum_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('curriculum_courses', function (Blueprint $table) {
            if (Schema::hasColumn('curriculum_courses', 'program_name')) {
                $table->dropColumn('program_name');
            }
            if (Schema::hasColumn('curriculum_courses', 'curriculum_name')) {
                $table->dropColumn('curriculum_name');
            }
        });
    }
};


