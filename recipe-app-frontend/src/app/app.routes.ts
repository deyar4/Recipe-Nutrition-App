import { Routes } from '@angular/router';
import { RecipeListComponent } from './components/recipe-list/recipe-list';
import { RecipeFormComponent } from './components/recipe-form/recipe-form';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' }, // Default route
  { path: 'recipes', component: RecipeListComponent },
  { path: 'recipes/new', component: RecipeFormComponent },
  { path: 'recipes/edit/:id', component: RecipeFormComponent }, // For editing existing recipes
  { path: 'recipes/:id', component: RecipeDetailComponent }, // For viewing recipe details
  { path: '**', redirectTo: '/recipes' } // Wildcard for any other route
];
