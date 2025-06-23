import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../services/recipe';
import { Recipe } from '../../models/recipe.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.html',
  styleUrls: ['./recipe-list.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];

  constructor(private recipeService: RecipeService) { }

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.recipeService.getAllRecipes().subscribe({
      next: (data) => {
        this.recipes = data;
      },
      error: (err) => {
        console.error('Failed to load recipes', err);
        // Implement user-friendly error message here
      }
    });
  }

  deleteRecipe(id: number | undefined): void {
    if (id === undefined) return;

    if (confirm('Are you sure you want to delete this recipe?')) {
      this.recipeService.deleteRecipe(id).subscribe({
        next: () => {
          this.recipes = this.recipes.filter(recipe => recipe.id !== id);
          console.log('Recipe deleted successfully!');
        },
        error: (err) => {
          console.error('Failed to delete recipe', err);
          // Implement user-friendly error message
        }
      });
    }
  }
}