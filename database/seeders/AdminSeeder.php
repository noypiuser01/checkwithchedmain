<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Admin;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update super admin credentials
        Admin::updateOrCreate(
            ['email' => 'hemis@chedro12.gov.ph'],
            [
                'name' => 'Super Admin',
                'password' => 'hemis123'
            ]
        );
    }
}
