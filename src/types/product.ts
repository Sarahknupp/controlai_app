export interface Ingredient {
  id: string;
  name: string;
  unitCost: number;
  unitType: string;
  quantity: number;
  inventoryId: string;
}

export interface Recipe {
  id: string;
  name: string;
  steps: string[];
  preparationTime: number;
  yield: number;
  ingredients: Ingredient[];
}

export interface Product {
  id: string;
  internalCode?: string;
  name: string;
  description: string;
  category: string;
  unitOfMeasure?: string;
  price: number;
  costPrice: number;
  ingredients: Ingredient[];
  image?: string;
  isActive: boolean;
  recipeId?: string;
  recipe?: Recipe;
  reorderPoint?: number;
  suggestedOrderQuantity?: number;
  lastRestockDate?: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}