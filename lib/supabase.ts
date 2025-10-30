import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are defined at runtime for security and robustness.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined!");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined!");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// DEPRECATED: Old ContentType definition - use @/lib/types instead
// This is kept for backward compatibility with legacy code only
// @deprecated Use ContentType from @/lib/types.ts instead
export type ContentType =
  | "trivia"
  | "stat" // Changed from "stats"
  | "motivational"
  | "quotes"
  | "stories";

// Types for the ingested table
export interface IngestedContent {
  id: number;
  content_text: string;
  word_count?: number;
  char_count?: number;
  used_for?: string[]; // Array tracking usage: 'mc', 'tf', 'whoami', 'stat', 'motivational', 'greeting', 'pbp'
  themes?: string;
}

export interface CreateIngestedContent {
  content_text: string;
  word_count?: number;
  char_count?: number;
  used_for?: string[];
}

// Legacy type alias for backward compatibility
export type ContentSource = IngestedContent;
export type CreateContentSource = CreateIngestedContent;

// Types for the content_processed table
export interface ContentProcessed {
  id: number;
  title: string;
  content_type: ContentType;
  markdown_content: string;
  status: "draft" | "published";
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContentProcessed {
  title: string;
  content_type: ContentType;
  markdown_content: string;
  status?: "draft" | "published";
}

// Types for the prompts table
// Actual schema: id, prompt_content, content_type
export interface Prompt {
  id: number;
  prompt_content: string;
  content_type?: string;
}

export interface CreatePrompt {
  prompt_content: string;
  content_type?: string;
}

// Types for categories table
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  emoji?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Types for trivia_questions table
export interface TriviaQuestion {
  id: number;
  question_text: string;
  question_type: "multiple-choice" | "true-false" | "who-am-i";
  correct_answer: string;
  wrong_answers: string[];
  theme?: string;
  explanation?: string;
  tags?: string[];
  status: string;
  source_content_id?: number;
  created_at: string;
  updated_at: string;
}

// Types for the trivia_sets table
export interface TriviaQuestionData {
  question_text: string;
  question_type: "multiple-choice" | "true-false" | "who-am-i";
  correct_answer: string;
  wrong_answers: string[];
  explanation?: string;
  tags?: string[];
}

export interface TriviaSet {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  theme?: string;
  tags: string[];
  difficulty?: string;
  question_count: number;
  question_data: TriviaQuestionData[];
  status: "draft" | "published" | "archived";
  visibility: "Public" | "Unlisted" | "Private";
  created_at: string;
  updated_at: string;
}

export interface CreateTriviaSet {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  theme?: string;
  tags?: string[];
  difficulty?: string;
  question_count: number;
  question_data: TriviaQuestionData[];
  status?: "draft" | "published" | "archived";
  visibility?: "Public" | "Unlisted" | "Private";
}
