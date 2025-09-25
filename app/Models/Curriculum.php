<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Curriculum extends Model
{
    protected $table = 'curricula';

    protected $fillable = [
        'curriculum_name',
        'program_name',
        'year_level',
        'semester',
        'status'
    ];

    /**
     * Get the courses for this curriculum.
     */
    public function courses(): HasMany
    {
        return $this->hasMany(CurriculumCourse::class);
    }
}
