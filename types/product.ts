export type ProductType = 'good' | 'service';

export interface Product {
  id: string;
  shop_id: string;
  category_id: string | null;
  title: string;
  description: string;
  type: ProductType;
  price: number | null;
  price_from: boolean;
  is_available: boolean;
  images: string[];
  views_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Join fields
  shop?: {
    name: string;
    slug: string;
    avatar_url: string | null;
  };
  category?: {
    name: string;
    slug: string;
  };
}

export interface ProductFormData {
  title: string;
  description: string;
  type: ProductType;
  price: number | null;
  price_from: boolean;
  is_available: boolean;
  category_id: string | null;
  images: string[];
}
