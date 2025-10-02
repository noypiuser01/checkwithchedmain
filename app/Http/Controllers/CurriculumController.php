<?php

namespace App\Http\Controllers;

use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\CurriculumReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CurriculumController extends Controller
{
    /**
     * Return distinct course titles filtered by selected CMO (curriculum_name) and category.
     * GET /api/cmo-category-titles?cmo[]=...&category=...
     */
    public function getTitlesByCmoAndCategory(Request $request)
    {
        $cmoNames = (array) $request->query('cmo', []);
        $category = $request->query('category');

        $query = CurriculumCourse::query();

        if (!empty($cmoNames)) {
            $query->whereIn('curriculum_name', $cmoNames);
        }

        if (!empty($category)) {
            $query->where('category', $category);
        }

        // Return distinct, sorted titles across all programs under the selected CMOs
        $titles = $query
            ->whereNotNull('title')
            ->where('title', '!=', '')
            ->select('title')
            ->distinct()
            ->orderBy('title')
            ->pluck('title')
            ->values();

        return response()->json($titles);
    }

    /**
     * Return distinct course categories filtered by selected CMO (curriculum_name).
     * GET /api/cmo-categories?cmo[]=...
     */
    public function getCategoriesByCmo(Request $request)
    {
        $cmoNames = (array) $request->query('cmo', []);

        $query = CurriculumCourse::query();

        if (!empty($cmoNames)) {
            $query->whereIn('curriculum_name', $cmoNames);
        }

        $categories = $query
            ->whereNotNull('category')
            ->pluck('category')
            ->filter()
            ->unique()
            ->values();

        return response()->json($categories);
    }

    /**
     * Return all distinct course categories from curriculum_courses table.
     * GET /api/categories
     */
    public function getAllCategories(Request $request)
    {
        $categories = CurriculumCourse::query()
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->pluck('category')
            ->filter()
            ->unique()
            ->sort()
            ->values();

        return response()->json($categories);
    }

    /**
     * Return course code based on title, category, and CMO.
     * GET /api/course-code-by-title?title=...&category=...&cmo[]=...
     */
    public function getCourseCodeByTitle(Request $request)
    {
        $title = $request->query('title');
        $category = $request->query('category');
        $cmoNames = (array) $request->query('cmo', []);

        if (empty($title) || empty($category) || empty($cmoNames)) {
            return response()->json('');
        }

        $query = CurriculumCourse::query();
        $query->whereIn('curriculum_name', $cmoNames);
        $query->where('title', $title);
        $query->where('category', $category);

        $courseCode = $query
            ->whereNotNull('code')
            ->where('code', '!=', '')
            ->pluck('code')
            ->first();

        return response()->json($courseCode ?: '');
    }

    /**
     * Return course details (including prerequisites) based on title, category, and CMO.
     * GET /api/course-details-by-title?title=...&category=...&cmo[]=...
     */
    public function getCourseDetailsByTitle(Request $request)
    {
        $title = $request->query('title');
        $category = $request->query('category');
        $cmoNames = (array) $request->query('cmo', []);

        if (empty($title) || empty($category) || empty($cmoNames)) {
            return response()->json(null);
        }

        $query = CurriculumCourse::query();
        $query->whereIn('curriculum_name', $cmoNames);
        $query->where('title', $title);
        $query->where('category', $category);

        $course = $query
            ->select('code', 'title', 'category', 'prereq', 'total_units', 'lec_units', 'lab_units')
            ->first();

        if ($course) {
            return response()->json([
                'code' => $course->code,
                'title' => $course->title,
                'category' => $course->category,
                'prereq' => $course->prereq,
                'total_units' => $course->total_units,
                'lec_units' => $course->lec_units,
                'lab_units' => $course->lab_units
            ]);
        }

        return response()->json(null);
    }

    /**
     * Return course details (including prerequisites) based on course code and CMO.
     * GET /api/course-details-by-code?code=...&cmo[]=...
     */
    public function getCourseDetailsByCode(Request $request)
    {
        $code = $request->query('code');
        $cmoNames = (array) $request->query('cmo', []);

        if (empty($code) || empty($cmoNames)) {
            return response()->json(null);
        }

        $query = CurriculumCourse::query();
        $query->whereIn('curriculum_name', $cmoNames);
        $query->where('code', $code);

        $course = $query
            ->select('code', 'title', 'category', 'prereq', 'total_units', 'lec_units', 'lab_units')
            ->first();

        if ($course) {
            return response()->json([
                'code' => $course->code,
                'title' => $course->title,
                'category' => $course->category,
                'prereq' => $course->prereq,
                'total_units' => $course->total_units,
                'lec_units' => $course->lec_units,
                'lab_units' => $course->lab_units
            ]);
        }

        return response()->json(null);
    }

    /**
     * Return distinct program names filtered by selected CMO (curriculum_name).
     * GET /api/cmo-program-names?cmo[]=...
     */
    public function getProgramNamesByCmo(Request $request)
    {
        $cmoNames = (array) $request->query('cmo', []);

        $query = Curriculum::query();

        if (!empty($cmoNames)) {
            $query->whereIn('curriculum_name', $cmoNames);
        }

        $programNames = $query
            ->whereNotNull('program_name')
            ->pluck('program_name')
            ->filter()
            ->unique()
            ->values();

        return response()->json($programNames);
    }

    /**
     * Get curriculum requirements (total units, category breakdown, prerequisites) for selected CMO/PSG References.
     * GET /api/curriculum-requirements?cmo[]=...&program=...
     */
    public function getCurriculumRequirements(Request $request)
    {
        $cmoNames = (array) $request->query('cmo', []);
        $programName = $request->query('program');

        if (empty($cmoNames)) {
            return response()->json([
                'totalUnits' => 0,
                'categories' => [],
                'prerequisites' => []
            ]);
        }

        $query = CurriculumCourse::query();
        $query->whereIn('curriculum_name', $cmoNames);

        if (!empty($programName)) {
            $query->where('program_name', $programName);
        }

        // Get all courses for the selected CMO/PSG and program
        $courses = $query->get();

        // Calculate total units
        $totalUnits = $courses->sum('total_units');

        // Group by category and sum units
        $categories = $courses->groupBy('category')->map(function($categoryCourses) {
            return $categoryCourses->sum('total_units');
        })->toArray();

        // Extract unique prerequisites
        $prerequisites = $courses->whereNotNull('prereq')
            ->where('prereq', '!=', '')
            ->pluck('prereq')
            ->map(function($prereq) {
                return explode(',', $prereq);
            })
            ->flatten()
            ->map(function($prereq) {
                return trim($prereq);
            })
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        return response()->json([
            'totalUnits' => $totalUnits,
            'categories' => $categories,
            'prerequisites' => $prerequisites,
            'courseCount' => $courses->count()
        ]);
    }

    /**
     * Get total units for each program in selected CMO/PSG references.
     * GET /api/cmo-program-totals?cmo[]=...
     */
    public function getCmoProgramTotals(Request $request)
    {
        $cmoNames = (array) $request->query('cmo', []);

        if (empty($cmoNames)) {
            return response()->json([]);
        }

        $query = CurriculumCourse::query();
        $query->whereIn('curriculum_name', $cmoNames);

        // Get all courses for the selected CMO/PSG references
        $courses = $query->get();

        // Group by program_name and sum total_units
        $programTotals = $courses->groupBy('program_name')->map(function($programCourses) {
            return [
                'program_name' => $programCourses->first()->program_name,
                'total_units' => $programCourses->sum('total_units')
            ];
        })->values();

        return response()->json($programTotals);
    }

    /**
     * Get total units for each program in the current user's curriculum for selected CMO/PSG references.
     * GET /api/curriculum-program-totals?cmo[]=...
     */
    public function getCurriculumProgramTotals(Request $request)
    {
        $cmoNames = (array) $request->query('cmo', []);

        if (empty($cmoNames)) {
            return response()->json([]);
        }

        // This endpoint would typically get the user's current curriculum data
        // For now, we'll return empty data as this would need user session/authentication
        // In a real implementation, you'd fetch the user's curriculum courses and group by program
        
        return response()->json([]);
    }

    /**
     * Get courses filtered by program name and CMO/PSG references.
     * GET /api/cmo-program-courses?cmo[]=...&program=...
     */
    public function getCmoProgramCourses(Request $request)
    {
        $cmoNames = (array) $request->query('cmo', []);
        $programName = $request->query('program');

        if (empty($cmoNames)) {
            return response()->json([]);
        }

        $query = CurriculumCourse::query();
        $query->whereIn('curriculum_name', $cmoNames);

        if (!empty($programName)) {
            $query->where('program_name', $programName);
        }

        // Get all courses for the selected CMO/PSG and program
        $courses = $query->get();

        // Group by program_name and calculate totals
        $programData = $courses->groupBy('program_name')->map(function($programCourses) {
            $totalUnits = $programCourses->sum('total_units');
            $lecUnits = $programCourses->sum('lec_units');
            $labUnits = $programCourses->sum('lab_units');
            
            // Group by category for breakdown
            $byCategory = $programCourses->groupBy('category')->map(function($categoryCourses) {
                return $categoryCourses->sum('total_units');
            })->toArray();

            // Create a map of course codes to their details for easy lookup
            $courseDetails = $programCourses->mapWithKeys(function($course) {
                return [
                    $course->code => [
                        'code' => $course->code,
                        'title' => $course->title,
                        'category' => $course->category,
                        'total_units' => $course->total_units,
                        'lec_units' => $course->lec_units,
                        'lab_units' => $course->lab_units,
                        'prereq' => $course->prereq
                    ]
                ];
            })->toArray();

            return [
                'program_name' => $programCourses->first()->program_name,
                'total_units' => $totalUnits,
                'lec_units' => $lecUnits,
                'lab_units' => $labUnits,
                'by_category' => $byCategory,
                'course_count' => $programCourses->count(),
                'course_details' => $courseDetails
            ];
        })->values();

        return response()->json($programData);
    }
    /**
     * Display a listing of the curricula.
     */
    public function index()
    {
        // Check if admin is authenticated
        if (!session('admin_id')) {
            return redirect('/admin/login');
        }

        $curricula = Curriculum::with('courses')->orderBy('created_at', 'desc')->get();
        
        // Group curricula by curriculum_name and program_name
        $groupedCurricula = $curricula->groupBy(['curriculum_name', 'program_name'])->map(function($programGroup) {
            return $programGroup->map(function($curriculumGroup) {
                return [
                    'id' => $curriculumGroup->first()->id,
                    'curriculum_name' => $curriculumGroup->first()->curriculum_name,
                    'program_name' => $curriculumGroup->first()->program_name,
                    'status' => $curriculumGroup->first()->status ?? 'active',
                    'semesters' => $curriculumGroup->map(function($curriculum) {
                        return [
                            'id' => $curriculum->id,
                            'year_level' => $curriculum->year_level,
                            'semester' => $curriculum->semester,
                            'status' => $curriculum->status ?? 'active',
                            'courses' => $curriculum->courses,
                            'created_at' => $curriculum->created_at,
                            'updated_at' => $curriculum->updated_at
                        ];
                    })->sortBy(['year_level', 'semester'])->values()
                ];
            })->values();
        })->flatten(1)->values();
        
        return Inertia::render('Admin/CurriculumList', [
            'curricula' => $curricula,
            'groupedCurricula' => $groupedCurricula,
            'success' => session('success'),
            'error' => session('error'),
            'admin' => [
                'name' => session('admin_name'),
                'email' => session('admin_email'),
                'type' => session('admin_type')
            ]
        ]);
    }

    /**
     * Show the form for creating a new curriculum.
     */
    public function create()
    {
        // Check if admin is authenticated
        if (!session('admin_id')) {
            return redirect('/admin/login');
        }

        // Get existing curricula for the dropdown
        $existingCurricula = Curriculum::select('id', 'curriculum_name', 'program_name')
            ->orderBy('curriculum_name')
            ->orderBy('program_name')
            ->get();

        return Inertia::render('Admin/AddCurriculum', [
            'existingCurricula' => $existingCurricula,
            'admin' => [
                'name' => session('admin_name'),
                'email' => session('admin_email'),
                'type' => session('admin_type')
            ]
        ]);
    }

    /**
     * Store a newly created curriculum in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'curriculumName' => 'required|string|max:255',
            'programName' => 'required|string|max:255',
            'courses' => 'nullable|array',
            'courses.*.code' => 'nullable|string|max:50',
            'courses.*.category' => 'nullable|string|max:100',
            'courses.*.title' => 'nullable|string|max:255',
            'courses.*.totalUnits' => 'nullable|numeric|min:0|max:99.9',
            'courses.*.lecUnits' => 'nullable|numeric|min:0|max:99.9',
            'courses.*.labUnits' => 'nullable|numeric|min:0|max:99.9',
            'courses.*.prereq' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Extract CMO info (number and year) from curriculum name
            $newCmoInfo = $this->extractCmoInfo($validated['curriculumName']);
            $newCurriculumYear = $newCmoInfo['year'] ?? $this->extractYearFromCurriculumName($validated['curriculumName']);

            // Find existing curricula with the SAME CMO number (regardless of year) and same program
            $allProgramCurricula = Curriculum::where('program_name', $validated['programName'])->get();
            $existingCurricula = $allProgramCurricula->filter(function ($curriculum) use ($newCmoInfo) {
                if (!$newCmoInfo) return false;
                $info = $this->extractCmoInfo($curriculum->curriculum_name);
                return $info && $info['number'] === $newCmoInfo['number'];
            })->values();

            // Check if curriculum with the EXACT same name and program already exists
            $existingCurriculum = Curriculum::where('curriculum_name', $validated['curriculumName'])
                ->where('program_name', $validated['programName'])
                ->first();

            if ($existingCurriculum) {
                // Check if we need to make old curricula inactive based on year
                if ($newCurriculumYear) {
                    foreach ($existingCurricula as $existing) {
                        $existingInfo = $this->extractCmoInfo($existing->curriculum_name);
                        $existingYear = $existingInfo['year'] ?? $this->extractYearFromCurriculumName($existing->curriculum_name);
                        if ($existingYear && $newCurriculumYear > $existingYear) {
                            // New curriculum is newer, make old one inactive
                            $existing->update(['status' => 'inactive']);
                        } elseif ($existingYear && $newCurriculumYear < $existingYear) {
                            // New curriculum is older, make it inactive (handled after create if not exact match)
                        }
                    }
                }

                // If curriculum exists, add courses to it
                if (!empty($validated['courses'])) {
                    foreach ($validated['courses'] as $courseData) {
                        // Skip empty rows
                        if ((empty($courseData['code']) && empty($courseData['title'])) &&
                            (!isset($courseData['lecUnits']) && !isset($courseData['labUnits']))) {
                            continue;
                        }

                        $computedTotalUnits = (float)($courseData['lecUnits'] ?? 0) + (float)($courseData['labUnits'] ?? 0);
                        CurriculumCourse::create([
                            'curriculum_id' => $existingCurriculum->id,
                            'curriculum_name' => $existingCurriculum->curriculum_name,
                            'program_name' => $existingCurriculum->program_name,
                            'code' => $courseData['code'] ?? '',
                            'category' => $courseData['category'] ?? null,
                            'title' => $courseData['title'] ?? '',
                            'total_units' => $courseData['totalUnits'] !== '' ? $courseData['totalUnits'] : $computedTotalUnits,
                            'lec_units' => $courseData['lecUnits'] ?? 0,
                            'lab_units' => $courseData['labUnits'] ?? 0,
                            'prereq' => $courseData['prereq'] ?? null,
                        ]);
                    }
                }
                // Nothing else to create; commit transaction and redirect
                DB::commit();
                return redirect('/admin/CurriculumList')
                    ->with('success', 'Courses added to existing curriculum successfully!');
            }

            // Check if new curriculum should be inactive (older than existing ones)
            $shouldBeInactive = false;
            if ($newCurriculumYear && !$existingCurricula->isEmpty()) {
                foreach ($existingCurricula as $existing) {
                    $existingInfo = $this->extractCmoInfo($existing->curriculum_name);
                    $existingYear = $existingInfo['year'] ?? $this->extractYearFromCurriculumName($existing->curriculum_name);
                    if ($existingYear && $newCurriculumYear < $existingYear) {
                        $shouldBeInactive = true;
                        break;
                    }
                }
            }

            // Create new curriculum entry
            $curriculum = Curriculum::create([
                'curriculum_name' => $validated['curriculumName'],
                'program_name' => $validated['programName'],
                'year_level' => 'N/A',
                'semester' => 'N/A',
                'status' => $shouldBeInactive ? 'inactive' : 'active',
            ]);

            // After creating new curriculum, if it's the newest year among same CMO number, inactivate older ones
            if ($newCurriculumYear && !$existingCurricula->isEmpty()) {
                foreach ($existingCurricula as $existing) {
                    $existingInfo = $this->extractCmoInfo($existing->curriculum_name);
                    $existingYear = $existingInfo['year'] ?? $this->extractYearFromCurriculumName($existing->curriculum_name);
                    if ($existingYear && $newCurriculumYear > $existingYear) {
                        $existing->update(['status' => 'inactive']);
                    }
                }
            }

            // Create the courses for this curriculum/semester (if provided)
            if (!empty($validated['courses'])) {
                foreach ($validated['courses'] as $courseData) {
                    // Skip empty rows
                    if ((empty($courseData['code']) && empty($courseData['title'])) &&
                        (!isset($courseData['lecUnits']) && !isset($courseData['labUnits']))) {
                        continue;
                    }

                    $computedTotalUnits = (float)($courseData['lecUnits'] ?? 0) + (float)($courseData['labUnits'] ?? 0);
                    CurriculumCourse::create([
                        'curriculum_id' => $curriculum->id,
                        'curriculum_name' => $curriculum->curriculum_name,
                        'program_name' => $curriculum->program_name,
                        'code' => $courseData['code'] ?? '',
                        'category' => $courseData['category'] ?? null,
                        'title' => $courseData['title'] ?? '',
                        'total_units' => $courseData['totalUnits'] !== '' ? $courseData['totalUnits'] : $computedTotalUnits,
                        'lec_units' => $courseData['lecUnits'] ?? 0,
                        'lab_units' => $courseData['labUnits'] ?? 0,
                        'prereq' => $courseData['prereq'] ?? null,
                    ]);
                }
            }

            DB::commit();

            // Log the created curriculum for debugging
            Log::info('New curriculum created:', [
                'id' => $curriculum->id,
                'name' => $curriculum->curriculum_name,
                'program' => $curriculum->program_name
            ]);

            $message = $existingCurriculum 
                ? 'Courses added to existing curriculum successfully!' 
                : 'New curriculum created successfully!';
                
            if ($shouldBeInactive) {
                $message .= ' Note: This curriculum was marked as inactive because a newer version already exists.';
            }
            
            // Check if any older curricula were made inactive
            $inactivatedCount = 0;
            if ($newCurriculumYear && !$existingCurricula->isEmpty()) {
                foreach ($existingCurricula as $existing) {
                    $existingInfo = $this->extractCmoInfo($existing->curriculum_name);
                    $existingYear = $existingInfo['year'] ?? $this->extractYearFromCurriculumName($existing->curriculum_name);
                    if ($existingYear && $newCurriculumYear > $existingYear) {
                        $inactivatedCount++;
                    }
                }
            }
            
            if ($inactivatedCount > 0) {
                $message .= " Note: {$inactivatedCount} older CMO(s) with the same program have been marked as inactive.";
            }
                
            return redirect('/admin/CurriculumList')
                ->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create curriculum. Please try again.']);
        }
    }



   /**
 * Update the specified curriculum in storage.
 */
public function update(Request $request, Curriculum $curriculum)
{
    $validated = $request->validate([
        'curriculumName' => 'required|string|max:255',
        'programName' => 'required|string|max:255',
        'courses' => 'nullable|array',
        'courses.*.code' => 'nullable|string|max:50',
        'courses.*.category' => 'nullable|string|max:100',
        'courses.*.title' => 'nullable|string|max:255',
        'courses.*.totalUnits' => 'nullable|numeric|min:0|max:99.9',
        'courses.*.lecUnits' => 'nullable|numeric|min:0|max:99.9',
        'courses.*.labUnits' => 'nullable|numeric|min:0|max:99.9',
        'courses.*.prereq' => 'nullable|string|max:255',
    ]);

    try {
        DB::beginTransaction();

        // Extract CMO info (number and year) from curriculum name for comparison
        $newCmoInfo = $this->extractCmoInfo($validated['curriculumName']);
        $newCurriculumYear = $newCmoInfo['year'] ?? $this->extractYearFromCurriculumName($validated['curriculumName']);
        
        // Check if we need to update status based on year comparison
        $shouldBeInactive = false;
        if ($newCurriculumYear) {
            // Find other curricula with the SAME CMO number (regardless of year) and same program
            $allProgramCurricula = Curriculum::where('program_name', $validated['programName'])
                ->where('id', '!=', $curriculum->id)
                ->get();
            $otherCurricula = $allProgramCurricula->filter(function ($c) use ($newCmoInfo) {
                if (!$newCmoInfo) return false;
                $info = $this->extractCmoInfo($c->curriculum_name);
                return $info && $info['number'] === $newCmoInfo['number'];
            })->values();
                
            foreach ($otherCurricula as $other) {
                $otherInfo = $this->extractCmoInfo($other->curriculum_name);
                $otherYear = $otherInfo['year'] ?? $this->extractYearFromCurriculumName($other->curriculum_name);
                if ($otherYear && $newCurriculumYear < $otherYear) {
                    $shouldBeInactive = true;
                    break;
                } elseif ($otherYear && $newCurriculumYear > $otherYear) {
                    // Make the other curriculum inactive
                    $other->update(['status' => 'inactive']);
                }
            }
        }

        // Update the curriculum
        $curriculum->update([
            'curriculum_name' => $validated['curriculumName'],
            'program_name' => $validated['programName'],
            'status' => $shouldBeInactive ? 'inactive' : 'active',
        ]);

        // Delete existing courses and create new ones
        $curriculum->courses()->delete();

        // Only create courses if courses array exists and is not empty
        if (!empty($validated['courses'])) {
            foreach ($validated['courses'] as $courseData) {
                // Skip courses with empty code and title
                if (empty($courseData['code']) && empty($courseData['title'])) {
                    continue;
                }
                
                $computedTotalUnits = (float)($courseData['lecUnits'] ?? 0) + (float)($courseData['labUnits'] ?? 0);
                CurriculumCourse::create([
                    'curriculum_id' => $curriculum->id,
                    'curriculum_name' => $curriculum->curriculum_name,
                    'program_name' => $curriculum->program_name,
                    'code' => $courseData['code'] ?? '',
                    'category' => $courseData['category'] ?? null,
                    'title' => $courseData['title'] ?? '',
                    'total_units' => $courseData['totalUnits'] !== '' ? $courseData['totalUnits'] : $computedTotalUnits,
                    'lec_units' => $courseData['lecUnits'] ?? 0,
                    'lab_units' => $courseData['labUnits'] ?? 0,
                    'prereq' => $courseData['prereq'] ?? null,
                ]);
            }
        }

        DB::commit();

        $message = 'Curriculum updated successfully!';
        if ($shouldBeInactive) {
            $message .= ' Note: This curriculum was marked as inactive because a newer version already exists.';
        }
        
        // Check if any other curricula were made inactive
        $inactivatedCount = 0;
        if ($newCurriculumYear) {
            // Find other curricula with the SAME CMO number (regardless of year) and same program
            $allProgramCurricula = Curriculum::where('program_name', $validated['programName'])
                ->where('id', '!=', $curriculum->id)
                ->get();
            $otherCurricula = $allProgramCurricula->filter(function ($c) use ($newCmoInfo) {
                if (!$newCmoInfo) return false;
                $info = $this->extractCmoInfo($c->curriculum_name);
                return $info && $info['number'] === $newCmoInfo['number'];
            })->values();
                
            foreach ($otherCurricula as $other) {
                $otherInfo = $this->extractCmoInfo($other->curriculum_name);
                $otherYear = $otherInfo['year'] ?? $this->extractYearFromCurriculumName($other->curriculum_name);
                if ($otherYear && $newCurriculumYear > $otherYear) {
                    $inactivatedCount++;
                }
            }
        }
        
        if ($inactivatedCount > 0) {
            $message .= " Note: {$inactivatedCount} older CMO(s) with the same program have been marked as inactive.";
        }

        return redirect()->route('admin.curriculum-list')
            ->with('success', $message);

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => 'Failed to update curriculum. Please try again.']);
    }
}

    /**
     * Remove the specified curriculum from storage.
     */
    public function destroy(Curriculum $curriculum)
    {
        try {
            $curriculum->delete(); // This will cascade delete courses due to foreign key constraint

            return response()->json([
                'success' => true,
                'message' => 'Curriculum deleted successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete curriculum. Please try again.'
            ], 500);
        }
    }

    /**
     * Remove a specific course from a curriculum.
     */
    public function destroyCourse(CurriculumCourse $course)
    {
        try {
            $course->delete();

            return response()->json([
                'success' => true,
                'message' => 'Course deleted successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete course. Please try again.'
            ], 500);
        }
    }

    /**
     * Get all curricula for API consumption (used in CMO/PSG form)
     * Only returns active curricula (ignores inactive/old ones)
     */
    public function getAllCurricula()
    {
        $curricula = Curriculum::with('courses')
            ->where('status', 'active') // Use database status field
            ->orderBy('curriculum_name')
            ->orderBy('program_name')
            ->orderBy('year_level')
            ->orderBy('semester')
            ->get();

        // Group curricula by curriculum_name and program_name
        $groupedCurricula = $curricula->groupBy(['curriculum_name', 'program_name'])->map(function($programGroup) {
            return $programGroup->map(function($curriculumGroup) {
                return [
                    'id' => $curriculumGroup->first()->id,
                    'curriculum_name' => $curriculumGroup->first()->curriculum_name,
                    'program_name' => $curriculumGroup->first()->program_name,
                    'status' => $curriculumGroup->first()->status,
                    'semesters' => $curriculumGroup->map(function($curriculum) {
                        return [
                            'id' => $curriculum->id,
                            'year_level' => $curriculum->year_level,
                            'semester' => $curriculum->semester,
                            'courses' => $curriculum->courses->map(function($course) {
                                return [
                                    'id' => $course->id,
                                    'code' => $course->code,
                                    'title' => $course->title,
                                    'total_units' => $course->total_units,
                                    'lec_units' => $course->lec_units,
                                    'lab_units' => $course->lab_units,
                                    'category' => $course->category,
                                    'prereq' => $course->prereq,
                                    'curriculum_name' => $course->curriculum_name,
                                    'program_name' => $course->program_name,
                                ];
                            }),
                            'created_at' => $curriculum->created_at,
                            'updated_at' => $curriculum->updated_at
                        ];
                    })->sortBy(['year_level', 'semester'])->values()
                ];
            })->values();
        })->flatten(1)->values();

        return response()->json($groupedCurricula);
    }

    /**
     * Get all inactive curricula for listing purposes
     */
    public function getInactiveCurricula()
    {
        $curricula = Curriculum::with('courses')
            ->where('status', 'inactive')
            ->orderBy('curriculum_name')
            ->orderBy('program_name')
            ->orderBy('year_level')
            ->orderBy('semester')
            ->get();

        // Group curricula by curriculum_name and program_name
        $groupedCurricula = $curricula->groupBy(['curriculum_name', 'program_name'])->map(function($programGroup) {
            return $programGroup->map(function($curriculumGroup) {
                return [
                    'id' => $curriculumGroup->first()->id,
                    'curriculum_name' => $curriculumGroup->first()->curriculum_name,
                    'program_name' => $curriculumGroup->first()->program_name,
                    'status' => $curriculumGroup->first()->status,
                    'semesters' => $curriculumGroup->map(function($curriculum) {
                        return [
                            'id' => $curriculum->id,
                            'year_level' => $curriculum->year_level,
                            'semester' => $curriculum->semester,
                            'courses' => $curriculum->courses->map(function($course) {
                                return [
                                    'id' => $course->id,
                                    'code' => $course->code,
                                    'title' => $course->title,
                                    'total_units' => $course->total_units,
                                    'lec_units' => $course->lec_units,
                                    'lab_units' => $course->lab_units,
                                    'category' => $course->category,
                                    'prereq' => $course->prereq,
                                    'curriculum_name' => $course->curriculum_name,
                                    'program_name' => $course->program_name,
                                ];
                            }),
                            'created_at' => $curriculum->created_at,
                            'updated_at' => $curriculum->updated_at
                        ];
                    })->sortBy(['year_level', 'semester'])->values()
                ];
            })->values();
        })->flatten(1)->values();

        return response()->json($groupedCurricula);
    }

    /**
     * Store a generated curriculum verification report.
     * POST /api/curriculum-reports
     */
    public function storeCurriculumReport(Request $request)
    {
        $validated = $request->validate([
            'reference_no' => 'required|string|max:255',
            'faculty_name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'institute' => 'nullable|string|max:255',
            'program_name' => 'nullable|string|max:255',
            'cmo_references' => 'array',
            'cmo_references.*' => 'string',
            'generated_at' => 'nullable|date',
        ]);

        $report = CurriculumReport::create([
            'reference_no' => $validated['reference_no'],
            'faculty_name' => $validated['faculty_name'] ?? null,
            'position' => $validated['position'] ?? null,
            'institute' => $validated['institute'] ?? null,
            'program_name' => $validated['program_name'] ?? null,
            'cmo_references' => $validated['cmo_references'] ?? [],
            'generated_at' => $validated['generated_at'] ?? now(),
        ]);

        return response()->json(['success' => true, 'data' => $report]);
    }

    /**
     * Determine if a curriculum is active based on CMO number and year
     * Same logic as used in the frontend CurriculumList component
     */
    private function isCurriculumActive($curriculum, $allCurricula)
    {
        $extractCMOInfo = function($curriculumName) {
            preg_match('/CMO\s*No\.?\s*(\d+).*?(\d{4})/i', $curriculumName, $matches);
            return $matches ? ['number' => (int)$matches[1], 'year' => (int)$matches[2]] : null;
        };
        
        $currentCMO = $extractCMOInfo($curriculum['curriculum_name']);
        if (!$currentCMO) return true; // If no CMO info, consider it active
        
        // Find all curricula with the same CMO number
        $sameCMOCurricula = $allCurricula->filter(function($c) use ($currentCMO, $extractCMOInfo) {
            $cmoInfo = $extractCMOInfo($c['curriculum_name']);
            return $cmoInfo && $cmoInfo['number'] === $currentCMO['number'];
        });
        
        // If only one curriculum with this CMO number, it's active
        if ($sameCMOCurricula->count() === 1) return true;
        
        // Find the highest year for this CMO number
        $highestYear = $sameCMOCurricula->map(function($c) use ($extractCMOInfo) {
            $cmoInfo = $extractCMOInfo($c['curriculum_name']);
            return $cmoInfo ? $cmoInfo['year'] : 0;
        })->max();
        
        // If this curriculum has the highest year, it's active
        return $currentCMO['year'] === $highestYear;
    }

    /**
     * Extract year from curriculum name (e.g., "CMO No. 39 Series of 2021" -> 2021)
     */
    private function extractYearFromCurriculumName($curriculumName)
    {
        // Updated pattern to handle "CMO. No 27" format (with period after CMO)
        // Examples: "CMO No. 39 Series of 2021", "CMO 39 s. 2021", "CMO. No 27 Series of 2015"
        $pattern = '/CMO\.?\s*No\.?\s*\d+.*?(\d{4})/i';
        
        if (preg_match($pattern, $curriculumName, $matches)) {
            return (int) $matches[1];
        }
        
        return null;
    }

    /**
     * Extract CMO number and year from curriculum name.
     * Returns ['number' => int, 'year' => int] or null if not matched.
     * Handles variants like: "CMO No. 39 Series of 2021", "CMO 39 s. 2021"
     */
    private function extractCmoInfo($curriculumName)
    {
        // Updated pattern to handle "CMO. No 27" format (with period after CMO)
        $pattern = '/CMO\.?\s*(?:No\.?\s*)?(\d+)\D+?(\d{4})/i';
        if (preg_match($pattern, $curriculumName, $matches)) {
            return [
                'number' => (int) $matches[1],
                'year' => (int) $matches[2],
            ];
        }
        return null;
    }
}
