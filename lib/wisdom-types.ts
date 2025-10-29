// TypeScript types for the wisdom table

export interface Wisdom {
  id: number;
  title: string;
  musing: string;
  from_the_box: string;
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

export interface WisdomCreateInput {
  title: string;
  musing: string;
  from_the_box: string;
  theme?: string;
  category?: string;
  attribution?: string;
  status?: string;
  source_content_id?: number;
  used_in?: string[];
  display_order?: number;
}

export interface WisdomUpdateInput {
  title?: string;
  musing?: string;
  from_the_box?: string;
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

export interface WisdomFetchParams {
  status?: string;
  theme?: string;
  limit?: number;
  offset?: number;
}

export interface WisdomApiResponse {
  success: boolean;
  data?: Wisdom | Wisdom[];
  count?: number;
  error?: string;
}
