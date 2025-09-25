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
        Schema::create('curriculum_semesters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curriculum_id')->constrained('curricula')->onDelete('cascade');
            $table->string('year_level', 50);
            $table->string('semester', 50);
            $table->timestamps();
            
            // Ensure unique combination of curriculum_id, year_level, and semester
            $table->unique(['curriculum_id', 'year_level', 'semester'], 'unique_curriculum_semester');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum_semesters');
    }
};
