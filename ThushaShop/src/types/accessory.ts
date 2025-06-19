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
  price:number;
  sold:number;
  size: string;
  image: string; 
  weight: number;
  manufacturer: number; 
  created_at: string; 
}

export interface ApiAccessory {
  id: number;
  name: string;
  price: number;
  description: string;
  category: { id: number; name: string } | null;
  size: string;
  weight: number;
  stock: number;
  image: string;
  manufacturer: number;
  created_at: string;
  sold:number;
}