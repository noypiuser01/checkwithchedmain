<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\Curriculum;
use App\Models\User;
use App\Models\UserCurriculum;
use App\Models\CurriculumCourse;
use Carbon\Carbon;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('Admin/AdminLogin');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');
        
        // First, check if user exists in User model with Super Admin or Admin role
        $user = User::where('email', $credentials['email'])->first();
        
        if ($user && ($user->role === 'Super Admin' || $user->role === 'Admin')) {
            // Check if password matches
            if (Hash::check($credentials['password'], $user->password)) {
                // Store admin info in session with appropriate type
                session([
                    'admin_id' => $user->id, 
                    'admin_name' => $user->name, 
                    'admin_email' => $user->email,
                    'admin_type' => $user->role === 'Super Admin' ? 'super_admin' : 'admin'
                ]);
                
                // Redirect to admin dashboard using Inertia
                return redirect()->route('admin.dashboard');
            }
        }
        
        // Fallback: Check if admin exists in Admin model (for backward compatibility)
        $admin = Admin::where('email', $credentials['email'])->first();
        
        if ($admin && $admin->checkPassword($credentials['password'])) {
            // Store admin info in session with Super Admin privileges (Admin model users have full access)
            session([
                'admin_id' => $admin->id, 
                'admin_name' => $admin->name, 
                'admin_email' => $admin->email,
                'admin_type' => 'super_admin'
            ]);
            
            // Redirect to admin dashboard using Inertia
            return redirect()->route('admin.dashboard');
        }
        
        return back()->withErrors([
            'email' => 'Invalid credentials or insufficient permissions'
        ]);
    }

    public function dashboard()
    {
        // Check if admin is authenticated
        if (!session('admin_id')) {
            return redirect('/admin/login');
        }



        // Fetch real-time data from database
        $totalCurricula = Curriculum::count();
        $activeCurricula = Curriculum::where('status', 'active')->count();
        $inactiveCurricula = Curriculum::where('status', 'inactive')->count();
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $inactiveUsers = User::where('status', 'inactive')->count();
        
        // Log the counts for debugging
        \Log::info('Dashboard Data:', [
            'totalCurricula' => $totalCurricula,
            'activeCurricula' => $activeCurricula,
            'inactiveCurricula' => $inactiveCurricula,
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'inactiveUsers' => $inactiveUsers
        ]);
        
        // Calculate totals from database (source of truth)
        $curricula = Curriculum::with('courses')->get();
        $totalCourses = $curricula->sum(function($curriculum) {
            return $curriculum->courses ? $curriculum->courses->count() : 0;
        });
        // Sum from curriculum_courses table: prefer total_units, fallback to lec_units + lab_units
        $totalUnits = (float) CurriculumCourse::query()
            ->selectRaw('SUM(COALESCE(total_units, (COALESCE(lec_units,0) + COALESCE(lab_units,0)))) as total')
            ->value('total');

        // If no curricula exist, set defaults
        if ($totalCurricula === 0) {
            $curriculaByProgram = [];
            $monthlyCurricula = [
                ['month' => 'Jan', 'count' => 0],
                ['month' => 'Feb', 'count' => 0],
                ['month' => 'Mar', 'count' => 0],
                ['month' => 'Apr', 'count' => 0],
                ['month' => 'May', 'count' => 0],
                ['month' => 'Jun', 'count' => 0]
            ];
        }

        // Get curricula by program (active only)
        $curriculaByProgram = Curriculum::selectRaw('program_name, COUNT(*) as count')
            ->where('status', 'active')
            ->groupBy('program_name')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'program' => $item->program_name,
                    'count' => $item->count
                ];
            })
            ->toArray();

        // Get inactive curricula by program
        $inactiveCurriculaByProgram = Curriculum::selectRaw('program_name, COUNT(*) as count')
            ->where('status', 'inactive')
            ->groupBy('program_name')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'program' => $item->program_name,
                    'count' => $item->count
                ];
            })
            ->toArray();

        // If no curricula exist, set defaults
        if (empty($curriculaByProgram)) {
            $curriculaByProgram = [];
        }

        // Get user status distribution
        $userStatusDistribution = [
            [
                'status' => 'Active',
                'count' => $activeUsers,
                'color' => '#10B981'
            ],
            [
                'status' => 'Inactive',
                'count' => $inactiveUsers,
                'color' => '#EF4444'
            ]
        ];

        // Get monthly curriculum trends (last 6 months)
        $monthlyCurricula = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $count = Curriculum::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            $monthlyCurricula[] = [
                'month' => $date->format('M'),
                'count' => $count
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'admin' => [
                'name' => session('admin_name'),
                'email' => session('admin_email'),
                'type' => session('admin_type')
            ],
            'dashboardData' => [
                'totalCurricula' => $totalCurricula,
                'activeCurricula' => $activeCurricula,
                'inactiveCurricula' => $inactiveCurricula,
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'inactiveUsers' => $inactiveUsers,
                'totalCourses' => $totalCourses,
                'totalUnits' => $totalUnits,
                'curriculaByProgram' => $curriculaByProgram,
                'inactiveCurriculaByProgram' => $inactiveCurriculaByProgram,
                'userStatusDistribution' => $userStatusDistribution,
                'monthlyCurricula' => $monthlyCurricula
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->session()->forget(['admin_id', 'admin_name', 'admin_email', 'admin_type']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/admin/login');
    }
}
