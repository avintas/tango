import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export createClient for use in API routes
export { createClient };

// Types for sourced_text table
export type ContentType =
  | 'trivia_source'
  | 'story_source'
  | 'quote_source'
  | 'news_source'
  | 'stats_source'
  | 'lore_source'
  | 'hugs_source'
  | 'geo_source';

export interface SourcedText {
  id: number;
  original_text: string;
  processed_text?: string;
  content_type: ContentType;
  content_tags?: string[]; // Display labels like ["Geo", "Stats"]
  word_count?: number;
  char_count?: number;
  created_by?: string;
  created_at: string;
}

export interface CreateSourcedText {
  original_text: string;
  processed_text?: string;
  content_type: ContentType;
  content_tags?: string[]; // Display labels like ["Geo", "Stats"]
  word_count?: number;
  char_count?: number;
}
