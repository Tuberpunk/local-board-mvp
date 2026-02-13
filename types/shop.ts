export interface Shop {
  id: string;
  profile_id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  contact_telegram: string | null;
  contact_email: string | null;
  address: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Join fields
  products_count?: number;
}

export interface ShopFormData {
  name: string;
  slug: string;
  description: string;
  avatar_url: string | null;
  cover_url: string | null;
  contact_phone: string;
  contact_whatsapp: string;
  contact_telegram: string;
  contact_email: string;
  address: string;
  city: string;
}
