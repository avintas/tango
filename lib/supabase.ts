import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export createClient for use in API routes
export { createClient };

// Types for content_source table
export interface ContentSource {
  id: number;
  original_text: string;
  processed_content?: string;
  word_count?: number;
  char_count?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreateContentSource {
  original_text: string;
  processed_content?: string;
  word_count?: number;
  char_count?: number;
}
