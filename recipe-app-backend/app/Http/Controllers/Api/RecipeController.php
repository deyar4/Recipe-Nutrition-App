<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\NutritionService;

class RecipeController extends Controller
{
    public function __construct(private NutritionService $nutrition) {}

    public function index()
    {
        return Recipe::with(['ingredients', 'steps'])->get();
    }

    public function show($id)
    {
        return Recipe::with(['ingredients', 'steps'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string',
            'ingredients' => 'required|array',
            'ingredients.*.name'     => 'required|string',
            'ingredients.*.quantity' => 'required|numeric',
            'steps'       => 'required|array',
            'steps.*.description' => 'required|string',
            'steps.*.order'       => 'required|integer',
        ]);

        $recipe = null;
        DB::transaction(function () use ($data, &$recipe) {
            $recipe = Recipe::create(['title' => $data['title']]);
            $total = ['carbs'=>0, 'fat'=>0, 'protein'=>0];

            foreach ($data['ingredients'] as $item) {
                $macros = $this->nutrition->fetchMacros($item['name']);
                $scaled = $macros
                    ? [
                        'carbs'   => $macros['carbs']   * $item['quantity'] / 100,
                        'fat'     => $macros['fat']     * $item['quantity'] / 100,
                        'protein' => $macros['protein'] * $item['quantity'] / 100,
                    ]
                    : null;

                if ($scaled) {
                    $total['carbs']   += $scaled['carbs'];
                    $total['fat']     += $scaled['fat'];
                    $total['protein'] += $scaled['protein'];
                }

                $recipe->ingredients()->create([
                    'ingredient_name' => $item['name'],
                    'quantity'        => $item['quantity'],
                    'macros'          => $scaled,
                ]);
            }
            foreach ($data['steps'] as $step) {
                $recipe->steps()->create($step);
            }
            $recipe->update(['nutrition' => $total]);
        });

        return response()->json($recipe->load(['ingredients', 'steps']), 201);
    }

    public function update(Request $request, $id)
    {
        // TODO: Implement update logic mirroring store(), clearing old data
        return $this->show($id);
    }

    public function destroy($id)
    {
        Recipe::findOrFail($id)->delete();
        return response()->noContent();
    }
}
