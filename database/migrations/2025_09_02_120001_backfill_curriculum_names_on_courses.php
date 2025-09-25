<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Backfill curriculum_name and program_name for existing curriculum_courses
        DB::statement('
            UPDATE curriculum_courses cc
            JOIN curricula c ON c.id = cc.curriculum_id
            SET cc.curriculum_name = COALESCE(cc.curriculum_name, c.curriculum_name),
                cc.program_name = COALESCE(cc.program_name, c.program_name)
            WHERE cc.curriculum_name IS NULL OR cc.program_name IS NULL
        ');
    }

    public function down(): void
    {
        // Revert backfilled values to NULL only where they match current curriculum values
        DB::statement('
            UPDATE curriculum_courses cc
            JOIN curricula c ON c.id = cc.curriculum_id
            SET cc.curriculum_name = NULL,
                cc.program_name = NULL
            WHERE (cc.curriculum_name = c.curriculum_name OR cc.curriculum_name IS NULL)
              AND (cc.program_name = c.program_name OR cc.program_name IS NULL)
        ');
    }
};


