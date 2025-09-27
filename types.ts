
export interface InventoryItem {
  id: string;
  name: string;
  quantity: string;
  expiryDate: string; // Stored as 'YYYY-MM-DD'
}

export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export interface ScannedItem {
  name: string;
  quantity: string;
}

export interface CategorizedItem {
  name: string;
  category: string;
}
