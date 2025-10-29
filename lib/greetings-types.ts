// TypeScript types for the greetings table

export interface Greeting {
  id: number;
  greeting_text: string;
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

export interface GreetingCreateInput {
  greeting_text: string;
  attribution?: string;
  status?: string;
  source_content_id?: number;
  used_in?: string[];
  display_order?: number;
}

export interface GreetingUpdateInput {
  greeting_text?: string;
  attribution?: string;
  status?: string;
  source_content_id?: number;
  used_in?: string[];
  display_order?: number;
  published_at?: string;
  archived_at?: string;
}

export interface GreetingFetchParams {
  status?: string;
  limit?: number;
  offset?: number;
}

export interface GreetingApiResponse {
  success: boolean;
  data?: Greeting | Greeting[];
  count?: number;
  error?: string;
}
