<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserCurriculum;
use App\Models\Curriculum;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserCurriculumController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'curriculumName' => 'required|string|max:255',
            'programName' => 'required|string|max:255',
            'yearLevel' => 'required|string|max:255',
            'semester' => 'required|string|max:255',
            'subjects' => 'required|array|min:1',
            'subjects.*.code' => 'required|string|max:50',
            'subjects.*.title' => 'required|string|max:255',
            'subjects.*.totalUnits' => 'required|numeric|min:0',
            'subjects.*.lecUnits' => 'nullable|numeric|min:0',
            'subjects.*.labUnits' => 'nullable|numeric|min:0',
            'subjects.*.prereq' => 'nullable|string|max:255',
        ]);

        $userCurriculum = UserCurriculum::create([
            'user_id' => Auth::id(),
            'curriculum_name' => $request->curriculumName,
            'program_name' => $request->programName,
            'year_level' => $request->yearLevel,
            'semester' => $request->semester,
            'subjects' => $request->subjects,
        ]);

        // Return a redirect response for Inertia
        return redirect()->back()->with('success', 'Curriculum saved successfully');
    }

    public function index()
    {
        return Inertia::render('Users/UsersCurriculum');
    }
}
