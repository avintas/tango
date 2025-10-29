// TypeScript types for Stats Library

export interface Stat {
  id: number;
  stat_text: string;
  stat_value?: string | null;
  stat_category?: string | null;
  year?: number | null;
  theme?: string | null;
  category?: string | null;
  attribution?: string | null;
  status?: string | null;
  source_content_id?: number | null;
  used_in?: string[] | null;
  display_order?: number | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  archived_at?: string | null;
}

export interface StatCreateInput {
  stat_text: string;
  stat_value?: string;
  stat_category?: string;
  year?: number;
  theme?: string;
  category?: string;
  attribution?: string;
  status?: string;
  source_content_id?: number;
  used_in?: string[];
  display_order?: number;
}

export interface StatUpdateInput {
  stat_text?: string;
  stat_value?: string;
  stat_category?: string;
  year?: number;
  theme?: string;
  category?: string;
  attribution?: string;
  status?: string;
  source_content_id?: number;
  used_in?: string[];
  display_order?: number;
  published_at?: string;
  archived_at?: string;
}
