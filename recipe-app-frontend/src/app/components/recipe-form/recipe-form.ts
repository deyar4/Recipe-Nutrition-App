import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { RecipeService } from '../../services/recipe';
import { Recipe } from '../../models/recipe.model';
import { Ingredient } from '../../models/ingredient.model';
import { Step } from '../../models/step.model';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './recipe-form.html',
  styleUrls: ['./recipe-form.scss']
})
export class RecipeFormComponent implements OnInit {
  recipeForm!: FormGroup;
  isEditMode = false;
  recipeId: number | null = null;
  private localStorageKey = 'recipeFormDraft';

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
        this.loadFormFromLocalStorage();
      }
    });

    this.recipeForm.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(value => {
      if (!this.isEditMode) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(value));
      }
    });
  }

  private loadFormFromLocalStorage(): void {
    const savedData = localStorage.getItem(this.localStorageKey);
    if (savedData) {
      const formData = JSON.parse(savedData);
      this.recipeForm.patchValue({ title: formData.title });

      this.ingredients.clear();
      // FIXED: Use ingredient.ingredient_name from the loaded data
      formData.ingredients.forEach((ing: Ingredient) => this.addIngredient(ing.ingredient_name, ing.quantity, ing.unit));

      this.steps.clear();
      formData.steps.forEach((step: Step) => this.addStep(step.description, step.order));
    }
  }

  private clearLocalStorage(): void {
    localStorage.removeItem(this.localStorageKey);
  }

  loadRecipe(id: number): void {
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe: Recipe) => {
        this.recipeForm.patchValue({ title: recipe.title });

        this.ingredients.clear();
        // FIXED: Use ingredient.ingredient_name when loading recipe for edit
        recipe.ingredients.forEach(ing => this.addIngredient(ing.ingredient_name, ing.quantity, ing.unit));

        this.steps.clear();
        recipe.steps.forEach(step => this.addStep(step.description, step.order));

        this.clearLocalStorage();
      },
      error: (err) => {
        console.error('Failed to load recipe for editing', err);
        alert('Could not load recipe for editing. It might have been deleted.');
        this.router.navigate(['/recipes']);
      }
    });
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  // FIXED: The 'name' parameter for newIngredient now refers to ingredient_name
  newIngredient(name: string = '', quantity: number = 0, unit: string = ''): FormGroup {
    return this.fb.group({
      ingredient_name: [name, Validators.required], // Ensure this matches model
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

  onSubmit(): void {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      console.error('Form is invalid', this.recipeForm.value);
      alert('Please fill out all required fields correctly.');
      return;
    }

    const recipe: Recipe = this.recipeForm.value;

    if (this.isEditMode && this.recipeId) {
      this.recipeService.updateRecipe(this.recipeId, recipe).subscribe({
        next: (res) => {
          console.log('Recipe updated!', res);
          this.clearLocalStorage();
          this.router.navigate(['/recipes', this.recipeId]);
        },
        error: (err) => {
          console.error('Error updating recipe:', err);
          alert('Failed to update recipe. Please try again.');
        }
      });
    } else {
      this.recipeService.createRecipe(recipe).subscribe({
        next: (res) => {
          console.log('Recipe created!', res);
          this.clearLocalStorage();
          this.router.navigate(['/recipes', res.id]);
        },
        error: (err) => {
          console.error('Error creating recipe:', err);
          alert('Failed to create recipe. Please try again.');
        }
      });
    }
  }

  public goToRecipes() {
    this.router.navigate(['/recipes']);
  }
}
