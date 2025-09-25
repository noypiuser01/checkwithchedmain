<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CurriculumSemester extends Model
{
    protected $table = 'curriculum_semesters';

    protected $fillable = [
        'curriculum_id',
        'year_level',
        'semester'
    ];

    /**
     * Get the curriculum that owns this semester.
     */
    public function curriculum(): BelongsTo
    {
        return $this->belongsTo(Curriculum::class);
    }

    /**
     * Get the courses for this semester.
     */
    public function courses(): HasMany
    {
        return $this->hasMany(CurriculumCourse::class, 'curriculum_semester_id');
    }
}
