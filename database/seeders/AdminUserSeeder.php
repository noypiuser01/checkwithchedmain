<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Note: Admin access is now restricted to Admin model only
        // Regular users with Admin role no longer have admin panel access
        $this->command->info('Admin access is restricted to Admin model users only.');
        $this->command->info('Use AdminSeeder to create Super Admin account.');
    }
}
