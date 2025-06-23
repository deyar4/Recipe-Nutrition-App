import { Ingredient } from './ingredient.model';
import { Step } from './step.model';

export interface Recipe {
  id?: number;
  title: string;
  ingredients: Ingredient[];
  steps: Step[];
  created_at?: string;
  updated_at?: string;
  total_nutrition?: { // Optional field for calculated total nutrition
    carbs: number;
    fat: number;
    protein: number;
  };
}