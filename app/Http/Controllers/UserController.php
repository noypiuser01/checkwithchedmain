<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        // Check if admin is authenticated
        if (!session('admin_id')) {
            return redirect('/admin/login');
        }

        $users = User::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'admin' => [
                'name' => session('admin_name'),
                'email' => session('admin_email'),
                'type' => session('admin_type')
            ]
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return Inertia::render('Admin/AddUser');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:6|max:255',
            'role' => 'required|string|in:Super Admin,Admin|max:100',
            'department' => 'required|string|max:255',
            'status' => 'required|in:Active,Inactive',
            'phone' => 'nullable|string|max:50',
        ]);

        $user = User::create($validated);

        return redirect()->route('admin.user-management')
            ->with('success', 'User created successfully!');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return Inertia::render('Admin/UserShow', [
            'user' => $user
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        return Inertia::render('Admin/EditUser', [
            'user' => $user
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id . '|max:255',
            'password' => 'nullable|string|min:6|max:255',
            'role' => 'required|string|in:Super Admin,Admin|max:100',
            'department' => 'required|string|max:100',
            'status' => 'required|in:Active,Inactive',
            'phone' => 'nullable|string|max:50',
        ]);

        // Only update password if provided
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return back()->with('success', 'User updated successfully!');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.user-management')
            ->with('success', 'User deleted successfully!');
    }

    /**
     * Update the status of the specified user.
     */
    public function updateStatus(Request $request, User $user)
    {
        \Log::info('User status update requested', [
            'user_id' => $user->id,
            'current_status' => $user->status,
            'new_status' => $request->status,
            'request_data' => $request->all()
        ]);

        $validated = $request->validate([
            'status' => 'required|in:Active,Inactive',
        ]);

        \Log::info('Validation passed', ['validated_data' => $validated]);

        $user->update($validated);

        \Log::info('User status updated successfully', [
            'user_id' => $user->id,
            'new_status' => $user->status
        ]);

        // Check if this is an AJAX request
        if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'success' => true,
                'message' => 'User status updated successfully!',
                'user' => $user->fresh()
            ]);
        }

        // Return a redirect response for Inertia
        return redirect()->route('admin.user-management')
            ->with('success', 'User status updated successfully!');
    }
}
