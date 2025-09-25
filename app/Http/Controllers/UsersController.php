<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\Curriculum;
use App\Models\UserCurriculum;
use App\Models\User;

class UsersController extends Controller
{
    /**
     * Handle user login.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');
        
        // Check if user exists with User role
        $user = User::where('email', $credentials['email'])->first();
        
        if ($user && $user->role === 'User') {
            // Check if password matches
            if (Hash::check($credentials['password'], $user->password)) {
                // Check if user is active
                if ($user->status === 'Active') {
                    // Authenticate user using Laravel's auth system
                    auth()->login($user);
                    
                    // Redirect to users dashboard
                    return redirect()->route('users.dashboard');
                } else {
                    return back()->withErrors([
                        'email' => 'Your account is inactive. Please contact administrator.'
                    ]);
                }
            }
        }
        
        return back()->withErrors([
            'email' => 'Invalid credentials or insufficient permissions'
        ]);
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request)
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/users/login');
    }

    /**
     * Display the users dashboard.
     */
    public function dashboard(Request $request)
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return redirect('/users/login');
        }

        return Inertia::render('Users/UsersDashboard', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Display the curriculum list page.
     */
    public function curriculumList(Request $request)
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return redirect('/users/login');
        }

        $userCurricula = UserCurriculum::where('user_id', auth()->id())->get();

        return Inertia::render('Users/CurriculumList', [
            'auth' => [
                'user' => auth()->user()
            ],
            'userCurricula' => $userCurricula
        ]);
    }
}
