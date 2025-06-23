<?php

namespace App\Console\Commands;

use Illuminate\Support\Facades\Http;
use Illuminate\Console\Command;
class TestNutritionApi extends Command
{
    protected $signature = 'nutrition:test';
    protected $description = 'Test Nutrition API: GET existing ingredients and POST new ones';

    public function handle()
    {
        $url      = 'https://interview.workcentrix.de/ingredients.php';
        $username = env('NUTRITION_API_USERNAME');
        $password = env('NUTRITION_API_PASSWORD');

        if (! $username || ! $password) {
            return $this->error("Missing NUTRITION_API_USERNAME or NUTRITION_API_PASSWORD in .env");
        }

        $this->fetchAll($url, $username, $password);
        $this->searchIngredient($url, $username, $password, 'Apple');
        $this->postIngredients($url, $username, $password, [
            ['name' => 'Dragon Fruit', 'carbs' => 11.0, 'fat' => 0.4, 'protein' => 1.2],
            ['name' => 'Jackfruit',     'carbs' => 23.0, 'fat' => 0.6, 'protein' => 1.7],
        ]);

        return 0;
    }

    private function fetchAll(string $url, string $user, string $pass): void
    {
        $response = Http::withBasicAuth($user, $pass)->get($url);
        if ($response->successful()) {
            $this->info("All ingredients:");
            $this->line($response->body());
        } else {
            $this->error("Failed to fetch ingredients (HTTP {$response->status()})");
            exit(1);
        }
    }

    private function searchIngredient(string $url, string $user, string $pass, string $term): void
    {
        $response = Http::withBasicAuth($user, $pass)->get($url, ['ingredient' => $term]);
        if ($response->successful()) {
            $this->info("Search \"{$term}\":");
            $this->line($response->body());
        } elseif ($response->status() === 404) {
            $this->warn("No results for \"{$term}\".");
        } else {
            $this->error("Search failed for \"{$term}\" (HTTP {$response->status()})");
        }
    }

    private function postIngredients(string $url, string $user, string $pass, array $items): void
    {
        foreach ($items as $item) {
            $response = Http::withBasicAuth($user, $pass)
                            ->asForm()
                            ->post($url, $item);

            if ($response->successful()) {
                $this->info("Added {$item['name']}");
                $this->confirmPost($url, $user, $pass, $item['name']);
            } else {
                $this->error("Failed to add {$item['name']} (HTTP {$response->status()})");
            }
        }
    }

    private function confirmPost(string $url, string $user, string $pass, string $name): void
    {
        $response = Http::withBasicAuth($user, $pass)->get($url, ['ingredient' => $name]);
        if ($response->successful()) {
            $this->info("Confirmed {$name}: ");
            $this->line($response->body());
        } else {
            $this->warn("Could not confirm {$name} (HTTP {$response->status()})");
        }
    }
}