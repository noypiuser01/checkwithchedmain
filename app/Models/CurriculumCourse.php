<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurriculumCourse extends Model
{
    protected $table = 'curriculum_courses';

    protected $fillable = [
        'curriculum_id',
        'curriculum_semester_id',
        'curriculum_name',
        'program_name',
        'code',
        'category',
        'title',
        'total_units',
        'lec_units',
        'lab_units',
        'prereq'
    ];

    protected $casts = [
        'total_units' => 'decimal:2',
        'lec_units' => 'decimal:2',
        'lab_units' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (CurriculumCourse $course) {
            if ($course->curriculum_id && (empty($course->curriculum_name) || empty($course->program_name))) {
                $curriculum = Curriculum::find($course->curriculum_id);
                if ($curriculum) {
                    if (empty($course->curriculum_name)) {
                        $course->curriculum_name = $curriculum->curriculum_name;
                    }
                    if (empty($course->program_name)) {
                        $course->program_name = $curriculum->program_name;
                    }
                }
            }
        });

        static::updating(function (CurriculumCourse $course) {
            if ($course->curriculum_id && (empty($course->curriculum_name) || empty($course->program_name))) {
                $curriculum = Curriculum::find($course->curriculum_id);
                if ($curriculum) {
                    if (empty($course->curriculum_name)) {
                        $course->curriculum_name = $curriculum->curriculum_name;
                    }
                    if (empty($course->program_name)) {
                        $course->program_name = $curriculum->program_name;
                    }
                }
            }
        });
    }

    /**
     * Get the curriculum that owns this course.
     */
    public function curriculum(): BelongsTo
    {
        return $this->belongsTo(Curriculum::class);
    }

    /**
     * Get the semester that owns this course.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(CurriculumSemester::class, 'curriculum_semester_id');
    }
}
