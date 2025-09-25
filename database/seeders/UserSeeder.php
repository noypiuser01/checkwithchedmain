<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'John Doe',
            'email' => 'john.doe@ched.gov.ph',
            'password' => 'password123',
            'role' => 'Admin',
            'department' => 'IT Department',
            'status' => 'Active',
            'phone' => '+63 912 345 6789',
            'last_login' => '2024-01-15'
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane.smith@ched.gov.ph',
            'password' => 'password123',
            'role' => 'Manager',
            'department' => 'Curriculum',
            'status' => 'Active',
            'phone' => '+63 923 456 7890',
            'last_login' => '2024-01-14'
        ]);

        User::create([
            'name' => 'Mike Johnson',
            'email' => 'mike.johnson@ched.gov.ph',
            'password' => 'password123',
            'role' => 'User',
            'department' => 'Administration',
            'status' => 'Inactive',
            'phone' => '+63 934 567 8901',
            'last_login' => '2024-01-10'
        ]);

        User::create([
            'name' => 'Sarah Wilson',
            'email' => 'sarah.wilson@ched.gov.ph',
            'password' => 'password123',
            'role' => 'Editor',
            'department' => 'Content',
            'status' => 'Active',
            'phone' => '+63 945 678 9012',
            'last_login' => '2024-01-13'
        ]);
    }
}
