<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RecipeController;
Route::apiResource('recipes', RecipeController::class);
