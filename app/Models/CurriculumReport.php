<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CurriculumReport extends Model
{
    use HasFactory;

    protected $table = 'curriculum_reports';

    protected $fillable = [
        'reference_no',
        'faculty_name',
        'position',
        'institute',
        'program_name',
        'cmo_references',
        'generated_at',
    ];

    protected $casts = [
        'cmo_references' => 'array',
        'generated_at' => 'datetime',
    ];
}


