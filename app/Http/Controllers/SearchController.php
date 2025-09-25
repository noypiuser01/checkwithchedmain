<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SearchController extends Controller
{
    protected PortalService $portalService;

    public function __construct(PortalService $portalService)
    {
        $this->portalService = $portalService;
    }

   
    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->get('query', ''));

        if ($query === '') {
            return response()->json([]);
        }

        try {
            $allHEI = $this->portalService->fetchAllHEI();
            $isWildcard = preg_match('/[\*\%\?]/', $query) === 1;

            $results = collect($allHEI)
                ->map(function ($item) use ($query, $isWildcard) {
                    $name = (string) ($item['instName'] ?? '');
                    $code = (string) ($item['instCode'] ?? '');
                    $haystack = mb_strtolower(trim($name . ' ' . $code));

                    $matched = false;

                    if ($isWildcard) {
                        $escaped = preg_quote($query, '/');
                        $regexPattern = str_replace(['\*', '\%', '\?'], ['.*', '.*', '.'], $escaped);
                        $regex = "/{$regexPattern}/i";

                        foreach ([$name, $code] as $f) {
                            if (@preg_match($regex, $f) === 1) {
                                $matched = true;
                                break;
                            }
                        }
                    } else {
                        $tokens = preg_split('/\s+/', mb_strtolower($query), -1, PREG_SPLIT_NO_EMPTY);
                        $matched = collect($tokens)->every(fn($token) => mb_strpos($haystack, $token) !== false);
                    }

                    return $matched ? [
                        'name' => $name,
                        'code' => $code,
                    ] : null;
                })
                ->filter()
                ->take(10)
                ->values()
                ->all();

            return response()->json($results);
        } catch (\Throwable $e) {
            Log::error('Search error', ['error' => $e->getMessage()]);
            report($e);
            return response()->json([]);
        }
    }

    
    public function fetchPrograms(Request $request, string $code): JsonResponse
    {
        try {
            $instName = $request->query('name');
            $programs = $this->portalService->fetchPrograms($code, $instName);

            return response()->json($programs ?: []);
        } catch (\Throwable $e) {
            Log::error('Error fetching programs', ['error' => $e->getMessage()]);
            report($e);
            return response()->json([]);
        }
    }

   
    public function fetchProgramDetails(Request $request, string $code): JsonResponse
    {
        try {
            $programName = (string) $request->query('program');
            $instName = $request->query('name');

            if ($programName === '') {
                return response()->json([], 400);
            }

            $details = $this->portalService->fetchProgramDetails($code, $programName, $instName);

            // Server-side fallback: if status/address missing, try to fill from programs list
            $needsStatus = empty($details['status'] ?? '') || $details['status'] === 'N/A';
            $needsAddress = empty($details['address'] ?? '') || $details['address'] === 'N/A';

            if ($needsStatus || $needsAddress) {
                $programs = $this->portalService->fetchPrograms($code, (string)$instName);
                if (!empty($programs)) {
                    // find program by name (case-insensitive)
                    $needle = mb_strtolower(preg_replace('/\s+/', ' ', $programName));
                    $fromList = collect($programs)->first(function ($p) use ($needle) {
                        $name = mb_strtolower(preg_replace('/\s+/', ' ', (string)($p['programName'] ?? '')));
                        return $name === $needle || str_contains($name, $needle) || str_contains($needle, $name);
                    });

                    if ($fromList) {
                        if ($needsStatus) {
                            $details['status'] = $fromList['status'] ?? ($details['status'] ?? 'N/A');
                        }
                        if ($needsAddress) {
                            $details['address'] = $fromList['address'] ?? ($details['address'] ?? 'N/A');
                        }
                    }
                }
            }

            Log::info('Program details fetched', [
                'code' => $code,
                'program' => $programName,
                'instName' => $instName,
                'has_status' => !empty($details['status'] ?? ''),
                'has_address' => !empty($details['address'] ?? ''),
                'all_fields' => array_keys($details ?? []),
            ]);

            return response()->json($details ?: []);
        } catch (\Throwable $e) {
            Log::error('Error in fetchProgramDetails', ['error' => $e->getMessage()]);
            report($e);
            return response()->json([]);
        }
    }

    
    public function fetchProgramMajors(Request $request, string $code): JsonResponse
    {
        try {
            $programName = (string) $request->query('program');

            if ($programName === '') {
                return response()->json([], 400);
            }

            $majors = $this->portalService->fetchMajors($code, $programName);

            return response()->json($majors ?: []);
        } catch (\Throwable $e) {
            Log::error('Error fetching majors', ['error' => $e->getMessage()]);
            report($e);
            return response()->json([]);
        }
    }

    public function fetchAddress(Request $request, string $code): JsonResponse
    {
        try {
            $instName = $request->query('name');
            
            // Get all HEI data to find the specific institution
            $allHEI = $this->portalService->fetchAllHEI();
            $institution = collect($allHEI)->first(function ($item) use ($code) {
                return ($item['instCode'] ?? '') === $code;
            });

            if (!$institution) {
                Log::warning('Institution not found for address fetch', ['code' => $code, 'instName' => $instName]);
                return response()->json(['error' => 'Institution not found'], 404);
            }

            // Extract address information from the institution data
            $addressData = [
                'address' => $institution['address'] ?? $institution['location'] ?? null,
                'city' => $institution['city'] ?? null,
                'province' => $institution['province'] ?? null,
                'region' => $institution['region'] ?? null,
                'fullAddress' => $institution['fullAddress'] ?? null,
                'location' => $institution['location'] ?? null,
            ];

            // If no address data found, try to construct from available parts
            if (empty(array_filter($addressData))) {
                $locationParts = [];
                if ($institution['city']) $locationParts[] = $institution['city'];
                if ($institution['province']) $locationParts[] = $institution['province'];
                if ($institution['region']) $locationParts[] = $institution['region'];
                
                if (!empty($locationParts)) {
                    $addressData['address'] = implode(', ', $locationParts);
                }
            }

            // Remove null values
            $addressData = array_filter($addressData, function($value) {
                return $value !== null && $value !== '';
            });

            Log::info('Address fetched', [
                'code' => $code,
                'instName' => $instName,
                'addressData' => $addressData,
                'hasAddress' => !empty($addressData),
            ]);

            return response()->json($addressData);
        } catch (\Throwable $e) {
            Log::error('Error fetching address', ['error' => $e->getMessage()]);
            report($e);
            return response()->json(['error' => 'Failed to fetch address'], 500);
        }
    }

    public function fetchAllHEI(): JsonResponse
    {
        try {
            $allHEI = $this->portalService->fetchAllHEI();
            return response()->json($allHEI ?: []);
        } catch (\Throwable $e) {
            Log::error('Error fetching all HEI', ['error' => $e->getMessage()]);
            report($e);
            return response()->json([]);
        }
    }

    public function showSearchPage()
    {
        return Inertia::render('Dashboard');
    }
}
