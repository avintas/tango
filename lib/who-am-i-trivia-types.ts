// Who Am I Trivia Types
// Following Content Library Table Pattern

export interface WhoAmITrivia {
  id: number;
  question_text: string;
  correct_answer: string;
  explanation?: string | null;
  category?: string | null;
  theme?: string | null;
  difficulty?: string | null;
  tags?: string[] | null;
  attribution?: string | null;
  status?: string | null;
  used_in?: string[] | null;
  source_content_id?: number | null;
  display_order?: number | null;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  archived_at?: string | null;
}

export interface WhoAmITriviaCreateInput {
  question_text: string;
  correct_answer: string;
  explanation?: string | null;
  category?: string | null;
  theme?: string | null;
  difficulty?: string | null;
  tags?: string[] | null;
  attribution?: string | null;
  status?: string;
  source_content_id?: number | null;
}

export interface WhoAmITriviaUpdateInput {
  question_text?: string;
  correct_answer?: string;
  explanation?: string | null;
  category?: string | null;
  theme?: string | null;
  difficulty?: string | null;
  tags?: string[] | null;
  attribution?: string | null;
  status?: string;
  display_order?: number | null;
}

export interface WhoAmITriviaFetchParams {
  theme?: string;
  category?: string;
  difficulty?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface WhoAmITriviaApiResponse {
  success: boolean;
  data?: WhoAmITrivia | WhoAmITrivia[];
  count?: number;
  error?: string;
}
