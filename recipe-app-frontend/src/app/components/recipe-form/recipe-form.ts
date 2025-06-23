import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe';
import { Recipe } from '../../models/recipe.model';
import { debounceTime } from 'rxjs/operators'; // For local storage persistence
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.html',
  styleUrls: ['./recipe-form.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RecipeFormComponent implements OnInit {
  recipeForm!: FormGroup;
  isEditMode = false;
  recipeId: number | null = null;
  private localStorageKey = 'recipeFormDraft'; // Key for local storage

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      ingredients: this.fb.array([], Validators.required),
      steps: this.fb.array([], Validators.required),
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.recipeId = +id;
        this.loadRecipe(this.recipeId);
      } else {
        // Only load from local storage if not in edit mode (new recipe)
        this.loadFormFromLocalStorage();
      }
    });

    // Save form data to local storage on changes (debounce to avoid too many writes)
    this.recipeForm.valueChanges.pipe(
      debounceTime(500) // Wait 500ms after last change
    ).subscribe(value => {
      if (!this.isEditMode) { // Only persist drafts for new recipes
        localStorage.setItem(this.localStorageKey, JSON.stringify(value));
      }
    });
  }

  // --- Local Storage Persistence ---
  private loadFormFromLocalStorage(): void {
    const savedData = localStorage.getItem(this.localStorageKey);
    if (savedData) {
      const formData = JSON.parse(savedData);
      this.recipeForm.patchValue({ title: formData.title });

      // Rebuild FormArrays for ingredients and steps
      formData.ingredients.forEach((ing: any) => this.addIngredient(ing.name, ing.quantity, ing.unit));
      formData.steps.forEach((step: any) => this.addStep(step.description, step.order));
    }
  }

  private clearLocalStorage(): void {
    localStorage.removeItem(this.localStorageKey);
  }

  // --- Load Recipe for Edit Mode ---
  loadRecipe(id: number): void {
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe: Recipe) => {
        this.recipeForm.patchValue({ title: recipe.title });

        // Clear existing form arrays before populating
        this.ingredients.clear();
        this.steps.clear();

        // Populate ingredients
        recipe.ingredients.forEach(ing => this.addIngredient(ing.name, ing.quantity, ing.unit));

        // Populate steps
        recipe.steps.forEach(step => this.addStep(step.description, step.order));

        // Remove any draft in local storage if we successfully loaded for edit
        this.clearLocalStorage();
      },
      error: (err) => {
        console.error('Failed to load recipe for editing', err);
        // Redirect or show error message
        this.router.navigate(['/recipes']);
      }
    });
  }

  // --- FormArray Getters ---
  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  // --- Dynamic Ingredient Methods ---
  newIngredient(name: string = '', quantity: number = 0, unit: string = ''): FormGroup {
    return this.fb.group({
      name: [name, Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(1)]],
      unit: [unit]
    });
  }

  addIngredient(name: string = '', quantity: number = 0, unit: string = ''): void {
    this.ingredients.push(this.newIngredient(name, quantity, unit));
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  // --- Dynamic Step Methods ---
  newStep(description: string = '', order: number = this.steps.length + 1): FormGroup {
    return this.fb.group({
      description: [description, Validators.required],
      order: [order, [Validators.required, Validators.min(1)]]
    });
  }

  addStep(description: string = '', order: number = this.steps.length + 1): void {
    this.steps.push(this.newStep(description, order));
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  // --- Form Submission ---
  onSubmit(): void {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched(); // Show validation errors
      console.error('Form is invalid', this.recipeForm.value);
      return;
    }

    const recipe: Recipe = this.recipeForm.value;

    if (this.isEditMode && this.recipeId) {
      this.recipeService.updateRecipe(this.recipeId, recipe).subscribe({
        next: (res) => {
          console.log('Recipe updated!', res);
          this.clearLocalStorage(); // Clear draft on successful submission
          this.router.navigate(['/recipes', this.recipeId]); // Go to detail page
        },
        error: (err) => {
          console.error('Error updating recipe:', err);
          // Show user friendly error message
        }
      });
    } else {
      this.recipeService.createRecipe(recipe).subscribe({
        next: (res) => {
          console.log('Recipe created!', res);
          this.clearLocalStorage(); // Clear draft on successful submission
          this.router.navigate(['/recipes', res.id]); // Go to new recipe's detail page
        },
        error: (err) => {
          console.error('Error creating recipe:', err);
          // Show user friendly error message
        }
      });
    }
  }
}