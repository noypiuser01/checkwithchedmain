<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'status' => session('status'),
        ]);
    }

 
    public function update(Request $request): Response
    {
        // Simple profile update without authentication
        return Inertia::render('Profile/Edit', [
            'status' => 'Profile updated successfully!',
        ]);
    }

    public function destroy(Request $request): Response
    {
        // Simple account deletion without authentication
        return Inertia::render('Profile/Edit', [
            'status' => 'Account deleted successfully!',
        ]);
    }
}
