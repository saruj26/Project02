export interface Category {
  id: number;
  name: string;
}


export interface Accessory {
  id: number;
  name: string;
  description: string;
  category: Category;
  stock: number;
  image: string; 
  weight: number;
  manufacturer: number; 
  created_at: string; 
}