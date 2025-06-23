<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    protected $fillable = ['title', 'nutrition'];
    protected $casts = ['nutrition' => 'array'];

    public function ingredients()
    {
        return $this->hasMany(IngredientRecipe::class);
    }

    public function steps()
    {
        return $this->hasMany(Step::class)->orderBy('order');
    }
}
