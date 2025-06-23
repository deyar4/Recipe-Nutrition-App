import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe';
import { Recipe } from '../../models/recipe.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.html',
  styleUrls: ['./recipe-detail.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | undefined;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadRecipe(+id); // Convert string ID to number
      } else {
        this.error = 'No recipe ID provided.';
        this.isLoading = false;
      }
    });
  }

  loadRecipe(id: number): void {
    this.isLoading = true;
    this.error = null;
    this.recipeService.getRecipeById(id).subscribe({
      next: (data) => {
        this.recipe = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load recipe details', err);
        this.error = 'Could not load recipe. It might have been deleted or does not exist.';
        this.isLoading = false;
        // Optionally redirect to recipe list or show a persistent error
        // this.router.navigate(['/recipes']);
      }
    });
  }

  deleteRecipe(id: number | undefined): void {
    if (id === undefined) return;

    if (confirm('Are you sure you want to delete this recipe permanently?')) {
      this.recipeService.deleteRecipe(id).subscribe({
        next: () => {
          console.log('Recipe deleted successfully!');
          this.router.navigate(['/recipes']); // Navigate back to the list
        },
        error: (err) => {
          console.error('Failed to delete recipe:', err);
          // Show user-friendly error message
        }
      });
    }
  }
}