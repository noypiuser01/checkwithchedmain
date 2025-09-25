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
            // Add new semester reference
            $table->foreignId('curriculum_semester_id')->nullable()->after('curriculum_id');
            
            // Make curriculum_id nullable (for backward compatibility during migration)
            $table->foreignId('curriculum_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('curriculum_courses', function (Blueprint $table) {
            $table->dropForeign(['curriculum_semester_id']);
            $table->dropColumn('curriculum_semester_id');
            
            // Restore curriculum_id as required
            $table->foreignId('curriculum_id')->nullable(false)->change();
        });
    }
};
