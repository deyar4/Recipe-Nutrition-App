<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IngredientRecipe extends Model
{
    protected $table = 'ingredient_recipe';
    protected $fillable = ['ingredient_name', 'quantity', 'macros'];
    protected $casts = ['macros' => 'array'];

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }
}

