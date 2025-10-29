// TypeScript types for the motivational table

export interface Motivational {
  id: number;
  quote: string;
  context?: string | null;
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

export interface MotivationalCreateInput {
  quote: string;
  context?: string;
  theme?: string;
  category?: string;
  attribution?: string;
  status?: string;
  source_content_id?: number;
  used_in?: string[];
  display_order?: number;
}

export interface MotivationalUpdateInput {
  quote?: string;
  context?: string;
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

export interface MotivationalFetchParams {
  theme?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface MotivationalApiResponse {
  success: boolean;
  data?: Motivational | Motivational[];
  count?: number;
  error?: string;
}
