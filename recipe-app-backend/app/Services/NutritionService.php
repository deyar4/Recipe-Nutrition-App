<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class NutritionService
{
    protected string $url;
    protected array $auth;

    public function __construct()
    {
        $this->url = 'https://interview.workcentrix.de/ingredients.php';
        $this->auth = [
            env('NUTRITION_API_USERNAME'),
            env('NUTRITION_API_PASSWORD'),
        ];
    }

    /**
     * Fetch macro values (per 100g) for a given ingredient name.
     */
    public function fetchMacros(string $name): ?array
    {
        $response = Http::withBasicAuth(...$this->auth)
                        ->get($this->url, ['ingredient' => $name]);
        if (! $response->successful()) {
            return null;
        }
        return $response->json();
    }
}
