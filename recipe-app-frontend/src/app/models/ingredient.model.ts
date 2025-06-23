export interface Ingredient {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  resolved_nutrition?: { 
    carbs: number;
    fat: number;
    protein: number;
    note?: string; 
  };
}