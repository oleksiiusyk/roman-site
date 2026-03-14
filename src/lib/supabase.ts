import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Category = {
  id: string;
  name_en: string;
  name_uk: string;
  slug: string;
  icon?: string;
  created_at: string;
};

export type WorkImage = {
  id: string;
  work_id: string;
  image_url: string;
  thumbnail_url?: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
};

export type Work = {
  id: string;
  title_en: string;
  title_uk: string;
  description_en?: string;
  description_uk?: string;
  category_id: string;
  category?: Category;
  image_url: string;
  thumbnail_url?: string;
  images?: WorkImage[];
  views: number;
  created_at: string;
  date_created: string; // When Roman actually created the work
};

export type Comment = {
  id: string;
  work_id: string;
  author_name: string;
  content: string;
  created_at: string;
};

export type Rating = {
  id: string;
  work_id: string;
  user_id: string; // Session ID or IP hash
  rating: number; // 1-5
  created_at: string;
};