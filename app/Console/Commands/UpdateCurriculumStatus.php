<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Curriculum;
use Illuminate\Support\Facades\DB;

class UpdateCurriculumStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'curriculum:update-status {--force : Force update even if status is already set}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update curriculum status (active/inactive) based on CMO number and year logic';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting curriculum status update...');
        
        $force = $this->option('force');
        
        // Get all curricula
        $curricula = Curriculum::all();
        
        if ($curricula->isEmpty()) {
            $this->info('No curricula found.');
            return;
        }
        
        $this->info("Found {$curricula->count()} curricula to process.");
        
        $updated = 0;
        $skipped = 0;
        
        DB::beginTransaction();
        
        try {
            foreach ($curricula as $curriculum) {
                // Skip if status is already set and not forcing
                if (!$force && $curriculum->status) {
                    $skipped++;
                    continue;
                }
                
                $isActive = $this->isCurriculumActive($curriculum, $curricula);
                $newStatus = $isActive ? 'active' : 'inactive';
                
                // Only update if status changed
                if ($curriculum->status !== $newStatus) {
                    $curriculum->update(['status' => $newStatus]);
                    $updated++;
                    
                    $this->line("Updated: {$curriculum->curriculum_name} -> {$newStatus}");
                } else {
                    $skipped++;
                }
            }
            
            DB::commit();
            
            $this->info("Status update completed!");
            $this->info("Updated: {$updated} curricula");
            $this->info("Skipped: {$skipped} curricula");
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error updating curriculum status: " . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
    
    /**
     * Determine if a curriculum is active based on CMO number and year
     * Same logic as used in the frontend and API
     */
    private function isCurriculumActive($curriculum, $allCurricula)
    {
        $extractCMOInfo = function($curriculumName) {
            preg_match('/CMO\s*No\.?\s*(\d+).*?(\d{4})/i', $curriculumName, $matches);
            return $matches ? ['number' => (int)$matches[1], 'year' => (int)$matches[2]] : null;
        };
        
        $currentCMO = $extractCMOInfo($curriculum->curriculum_name);
        if (!$currentCMO) return true; // If no CMO info, consider it active
        
        // Find all curricula with the same CMO number
        $sameCMOCurricula = $allCurricula->filter(function($c) use ($currentCMO, $extractCMOInfo) {
            $cmoInfo = $extractCMOInfo($c->curriculum_name);
            return $cmoInfo && $cmoInfo['number'] === $currentCMO['number'];
        });
        
        // If only one curriculum with this CMO number, it's active
        if ($sameCMOCurricula->count() === 1) return true;
        
        // Find the highest year for this CMO number
        $highestYear = $sameCMOCurricula->map(function($c) use ($extractCMOInfo) {
            $cmoInfo = $extractCMOInfo($c->curriculum_name);
            return $cmoInfo ? $cmoInfo['year'] : 0;
        })->max();
        
        // If this curriculum has the highest year, it's active
        return $currentCMO['year'] === $highestYear;
    }
}