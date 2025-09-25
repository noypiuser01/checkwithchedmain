<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PortalService
{
    protected string $apiUrl = 'https://portal.chedro12.com/api/fetch-programs';
    protected ?string $apiKey;

    public function __construct()
    {
        $this->apiKey = env('PORTAL_API');

        if (empty($this->apiKey)) {
            Log::warning('PORTAL_API key is not set in environment variables');
        }
    }


    public function fetchPrograms(string $instCode, string $instName): array
    {
        $cacheKey = "chedro12_programs_{$instCode}_" . md5($instName);

        return Cache::remember($cacheKey, 600, function () use ($instCode, $instName) {
            $data = $this->postToCHED($instCode);

            return collect($data ?? [])
                ->filter(fn($item) =>
                    !empty($item['programName']) &&
                    trim($item['instName'] ?? '') === trim($instName) &&
                    trim($item['instCode'] ?? '') === trim($instCode)
                )
                ->map(fn($item) => [
                    'programName'      => $item['programName'],
                    'degreeName'       => $item['degreeName'] ?? ($item['degName'] ?? null),
                    'major'            => $item['majorName'] ?? ($item['major'] ?? null),
                    'status'           => $item['status'] ?? ($item['programStatus'] ?? $item['accreditationStatus'] ?? null),
                    'institutionName'  => $item['instName'] ?? ($item['institutionName'] ?? $item['heiName'] ?? null),
                    'address'          => $item['address'] ?? ($item['instAddress'] ?? $item['institutionAddress'] ?? $item['heiAddress'] ?? $item['location'] ?? null),
                ])
                ->values()
                ->all();
        });
    }

 
    public function fetchMajors(string $instCode, string $programName): array
    {
        $programName = trim($programName);
        $cacheKey = "chedro12_program_majors_{$instCode}_" . md5($programName);

        return Cache::remember($cacheKey, 600, function () use ($instCode, $programName) {
            $data = $this->postToCHED($instCode);

            return collect($data ?? [])
                ->filter(fn($item) => trim($item['programName'] ?? '') === $programName)
                ->pluck('majorName')
                ->filter()
                ->unique()
                ->values()
                ->all();
        });
    }

   public function fetchProgramDetails(string $instCode, string $programName, ?string $instName = null): array
{
    $programName = trim($programName);
    $cacheKey = "chedro12_program_details_{$instCode}_" . md5($programName . '|' . ($instName ?? ''));

    return Cache::remember($cacheKey, 600, function () use ($instCode, $programName, $instName) {
        $data = $this->postToCHED($instCode);

        $normalizedProgram = mb_strtolower(preg_replace('/\s+/', ' ', $programName));
        $normalizedInstName = $instName ? mb_strtolower(preg_replace('/\s+/', ' ', $instName)) : null;

        $collection = collect($data ?? []);

        $exact = $collection->first(function ($item) use ($normalizedProgram, $instCode, $normalizedInstName) {
            $itemProgram = mb_strtolower(preg_replace('/\s+/', ' ', $item['programName'] ?? ''));
            $itemInst    = mb_strtolower(preg_replace('/\s+/', ' ', $item['instName'] ?? ''));
            $instMatches = ($normalizedInstName === null)
                || ($itemInst === $normalizedInstName)
                || (is_string($itemInst) && is_string($normalizedInstName) && (str_contains($itemInst, $normalizedInstName) || str_contains($normalizedInstName, $itemInst)));

            return $itemProgram === $normalizedProgram
                && trim($item['instCode'] ?? '') === trim($instCode)
                && $instMatches;
        });

        $match = $exact ?: $collection->first(function ($item) use ($normalizedProgram, $instCode, $normalizedInstName) {
            $itemProgram = mb_strtolower(preg_replace('/\s+/', ' ', $item['programName'] ?? ''));
            $itemInst    = mb_strtolower(preg_replace('/\s+/', ' ', $item['instName'] ?? ''));
            $instMatches = ($normalizedInstName === null)
                || ($itemInst === $normalizedInstName)
                || (is_string($itemInst) && is_string($normalizedInstName) && (str_contains($itemInst, $normalizedInstName) || str_contains($normalizedInstName, $itemInst)));

            return str_contains($itemProgram, $normalizedProgram)
                && trim($item['instCode'] ?? '') === trim($instCode)
                && $instMatches;
        });

        if (!$match) {
            return [];
        }

        Log::info('CHED match found', [
            'instCode' => $instCode,
            'programName' => $programName,
            'instName' => $instName,
            'keys' => array_keys($match),
            'raw_status' => $match['status'] ?? ($match['programStatus'] ?? ($match['accreditationStatus'] ?? null)),
            'raw_address' => $match['address'] ?? ($match['instAddress'] ?? ($match['institutionAddress'] ?? ($match['heiAddress'] ?? ($match['location'] ?? null)))),
        ]);

        // Deep helpers
        $deepFind = function ($arr, $needle) {
            $needle = strtolower($needle);
            $queue = [$arr];
            $visited = [];
            while ($queue) {
                $current = array_shift($queue);
                if (!is_array($current)) continue;
                $oid = spl_object_id((object)$current);
                if (isset($visited[$oid])) continue;
                $visited[$oid] = true;
                foreach ($current as $k => $v) {
                    if (is_string($k) && str_contains(strtolower($k), $needle)) {
                        if (is_scalar($v)) return $v;
                        if (is_array($v)) return $v; // caller decides how to serialize
                    }
                    if (is_array($v)) $queue[] = $v;
                }
            }
            return null;
        };

        // Status normalization
        $statusRaw = $match['status'] ?? ($match['programStatus'] ?? ($match['accreditationStatus'] ?? null));
        if ($statusRaw === null) {
            $statusRaw = $deepFind($match, 'status');
        }
        $status = 'N/A';
        if (is_bool($statusRaw)) {
            $status = $statusRaw ? 'Active' : 'Inactive';
        } elseif (is_numeric($statusRaw)) {
            $status = ((int)$statusRaw === 1) ? 'Active' : 'Inactive';
        } elseif (is_string($statusRaw)) {
            $s = strtolower(trim($statusRaw));
            if (in_array($s, ['active','inactive'], true)) {
                $status = ucfirst($s);
            } elseif (in_array($s, ['1','true','yes','y'], true)) {
                $status = 'Active';
            } elseif (in_array($s, ['0','false','no','n'], true)) {
                $status = 'Inactive';
            } else {
                $status = $statusRaw;
            }
        }

        // Address normalization
        $address = $match['address']
            ?? ($match['instAddress']
            ?? ($match['institutionAddress']
            ?? ($match['heiAddress']
            ?? ($match['location'] ?? null))));
        if (empty($address)) {
            $addrCandidate = $deepFind($match, 'address');
            if (is_array($addrCandidate)) {
                $parts = [];
                foreach (['street','address1','address2','city','province','state','region','zip','zipcode','postal','country','barangay'] as $key) {
                    if (!empty($addrCandidate[$key])) $parts[] = (string)$addrCandidate[$key];
                }
                $address = $parts ? implode(', ', $parts) : null;
            } elseif (!empty($addrCandidate)) {
                $address = (string)$addrCandidate;
            }
        }
        // Compose from common top-level fields if still empty
        if (empty($address)) {
            $composeKeys = [
                'street','address1','address2','barangay','town','city','municipality','province','region','state','zip','zipcode','postal','country','campus','building'
            ];
            $parts = [];
            foreach ($composeKeys as $k) {
                if (!empty($match[$k])) $parts[] = (string)$match[$k];
            }
            if ($parts) $address = implode(', ', $parts);
        }
        if (empty($address)) {
            $address = 'N/A';
        }

        return [
            'programName'     => $match['programName'] ?? null,
            'degreeName'      => $match['degreeName'] ?? ($match['degName'] ?? null),
            'major'           => $match['majorName'] ?? ($match['major'] ?? null),
            'institutionName' => $match['instName'] ?? ($match['institutionName'] ?? $match['heiName'] ?? null),
            'status'          => $status,
            'address'         => $address,
        ];
    });
}
    public function fetchAllHEI(): array
    {
        return Cache::remember('chedro12_allhei', 600, function () {
            try {
                $response = Http::withHeaders([
                    'PORTAL-API' => $this->apiKey,
                ])->timeout(60)->get('https://portal.chedro12.com/api/fetch-all-hei');

                if (!$response->ok()) {
                    Log::warning('CHED fetch-all-hei failed', ['status' => $response->status()]);
                    return [];
                }

                return collect($response->json() ?? [])
                    ->map(fn($item) => [
                        'instCode' => $item['instCode'] ?? null,
                        'instName' => $item['instName'] ?? null,
                        'address' => $item['address'] ?? $item['instAddress'] ?? $item['institutionAddress'] ?? $item['heiAddress'] ?? $item['location'] ?? null,
                        'city' => $item['city'] ?? null,
                        'province' => $item['province'] ?? null,
                        'region' => $item['region'] ?? null,
                        'fullAddress' => $item['fullAddress'] ?? null,
                        'location' => $item['location'] ?? null,
                    ])
                    ->sortBy('instName')
                    ->values()
                    ->all();
            } catch (\Throwable $e) {
                Log::error('CHED fetch-all-hei exception', ['message' => $e->getMessage()]);
                return [];
            }
        });
    }

    public function postToCHED(string $instCode): array
    {
        try {
            if (empty($this->apiKey)) {
                Log::error('Missing PORTAL_API key when calling postToCHED');
                return [];
            }

            $response = Http::withHeaders([
                'PORTAL-API' => $this->apiKey,
            ])->timeout(60)->post($this->apiUrl, [
                'instCode' => $instCode,
            ]);

            if (!$response->ok()) {
                Log::warning('CHED API error', [
                    'status'   => $response->status(),
                    'instCode' => $instCode,
                ]);
                return [];
            }

            return $response->json() ?? [];
        } catch (\Throwable $e) {
            Log::error('CHED API exception', [
                'message'  => $e->getMessage(),
                'instCode' => $instCode,
            ]);
            return [];
        }
    }
}
