export interface ApiProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  category: { id: number; name: string } | null;
  frame_type: { id: number; name: string } | null;
  size: string;
  weight: number;
  stock: number;
  images: File[];
  manufacturer: number;
  created_at: string;
  colors:string;
  features: string[];
  face_shapes: string[];
  vision_problems: string[];
  sold:number;
}

export interface Category {
  id: number;
  name: string;
}

export interface FrameType {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: File[];
  size: string;
  weight: number;
  sold:number;

  // Standardized as object
  category: Category;
  frame_type: FrameType;

  // Optional fields
  frameMaterial?: string;
  colors?: string;
  
  // Arrays
  features?: string[];
  face_shapes?: string[];
  vision_problems?: string[];
  
  // Metadata
  created_at?: string;
  manufacturer_id?: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  frameType: string;
  frameMaterial: string;
  colors: string;
  size: string;
  weight: string;
  features: string[];
  face_shapes: string[];
  vision_problems: string[];
}
