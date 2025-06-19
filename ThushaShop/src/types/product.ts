export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
}

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
  manufacturer: number;
  created_at: string;
  colors:string;
  features: string[];
  face_shapes: string[];
  vision_problems: string[];
  sold:number;
  images: ProductImage[];
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
  size: string;
  weight: number;
  sold:number;

  // Standardized as object
  category: Category;
  frame_type: FrameType;
  images: ProductImage[];

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
