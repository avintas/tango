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

// Define a union type for content_type to ensure type safety and consistency.
export type ContentType =
  | "trivia"
  | "stats"
  | "motivational"
  | "quotes"
  | "stories";

// Types for the ingested table
export interface IngestedContent {
  id: number;
  content_text: string;
  word_count?: number;
  char_count?: number;
  used_for?: string[]; // Array tracking usage: 'mc', 'tf', 'whoami', 'stats', 'motivational', 'greetings', 'pbp'
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
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContentProcessed {
  title: string;
  content_type: ContentType;
  markdown_content: string;
  status?: "draft" | "published";
  published_at?: string;
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
  id: string;
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
  status: "draft" | "review" | "approved" | "archived";
  visibility: "Public" | "Unlisted" | "Private";
  published_at?: string;
  scheduled_for?: string;
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
  status?: "draft" | "review" | "approved" | "archived";
  visibility?: "Public" | "Unlisted" | "Private";
}

// Types for the statistics table
// Actual schema: id, stat_category, stat_type, season_year, social_copy, tags
export interface StatsContent {
  id: number;
  stat_category?: string;
  stat_type?: string;
  season_year?: string;
  social_copy?: string;
  tags?: string[];
}

export interface CreateStatsContent {
  stat_category?: string;
  stat_type?: string;
  season_year?: string;
  social_copy?: string;
  tags?: string[];
}

// Types for the motivational table
// Actual schema: id, quote_text, attribution, context_story, theme
export interface MotivationalContent {
  id: number;
  quote_text: string;
  attribution?: string;
  context_story?: string;
  theme?: string;
}

export interface CreateMotivationalContent {
  quote_text: string;
  attribution?: string;
  context_story?: string;
  theme?: string;
}

// Types for the greetings table (HUG - Hockey Universal Greeting)
// Actual schema: id, greeting_text, theme, tone
export interface GreetingsContent {
  id: number;
  greeting_text: string;
  theme?: string;
  tone?: string;
}

export interface CreateGreetingsContent {
  greeting_text: string;
  theme?: string;
  tone?: string;
}

// Types for the pbp table (Penalty Box Philosopher)
// Actual schema: id, reflection_text, theme
export interface PbpContent {
  id: number;
  reflection_text: string;
  theme?: string;
}

export interface CreatePbpContent {
  reflection_text: string;
  theme?: string;
}
