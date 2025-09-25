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
        Schema::create('curriculum_courses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('curriculum_id');
            $table->string('code', 50);
            $table->string('title', 255);
            $table->decimal('total_units', 4, 2);
            $table->decimal('lec_units', 4, 2)->default(0);
            $table->decimal('lab_units', 4, 2)->default(0);
            $table->string('prereq', 255)->nullable();
            $table->timestamps();

            $table->foreign('curriculum_id')
                  ->references('id')
                  ->on('curricula')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum_courses');
    }
};
