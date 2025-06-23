import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // FOR *ngIf, *ngFor, DecimalPipe, DatePipe etc.
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // FOR routing and routerLink
import { ReactiveFormsModule } from '@angular/forms'; // FOR reactive forms

import { RecipeService } from '../../services/recipe';
import { Recipe } from '../../models/recipe.model'; // Correct import for Recipe

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [
    CommonModule, // Provides NgIf, NgFor, DecimalPipe, DatePipe, etc.
    RouterModule, // Provides routerLink
    ReactiveFormsModule // Provides reactive forms directives
  ],
  templateUrl: './recipe-detail.html', // Ensure this matches your filename!
  styleUrls: ['./recipe-detail.scss']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | undefined;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router, // <--- CHANGED FROM private TO public
    private recipeService: RecipeService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadRecipe(+id);
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
        alert(this.error);
        this.router.navigate(['/recipes']);
      }
    });
  }

  deleteRecipe(id: number | undefined): void {
    if (id === undefined) return;

    if (confirm('Are you sure you want to delete this recipe permanently?')) {
      this.recipeService.deleteRecipe(id).subscribe({
        next: () => {
          console.log('Recipe deleted successfully!');
          this.router.navigate(['/recipes']);
        },
        error: (err) => {
          console.error('Failed to delete recipe:', err);
          alert('Failed to delete recipe. Please try again.');
        }
      });
    }
  }
}
