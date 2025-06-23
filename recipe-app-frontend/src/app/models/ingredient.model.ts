export interface Ingredient {
  id?: number;
  recipe_id?: number;
  ingredient_name: string;
  quantity: number;
  unit?: string;
  macros?: { 
    carbs: number;
    fat: number;
    protein: number;
    note?: string; 
  };
}