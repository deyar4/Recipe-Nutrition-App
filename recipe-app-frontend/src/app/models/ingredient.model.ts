export interface Ingredient {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  resolved_nutrition?: { // Optional field for nutrition API response
    carbs: number;
    fat: number;
    protein: number;
    note?: string; // e.g., "Ingredient not found"
  };
}