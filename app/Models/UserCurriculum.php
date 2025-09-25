<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCurriculum extends Model
{
    protected $fillable = [
        'user_id',
        'curriculum_name',
        'program_name',
        'year_level',
        'semester',
        'subjects'
    ];

    protected $casts = [
        'subjects' => 'array'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
