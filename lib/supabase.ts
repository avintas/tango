import { createClient } from "@supabase/supabase-js";
import type { Theme } from "@/components/theme-selector";

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
  // Optional Process Builder fields
  question_id?: string; // Unique ID for this instance
  source_id?: number; // Reference to source question
  difficulty?: number;
  points?: number;
  time_limit?: number;
}

export interface TriviaSet {
  id: number; // BIGSERIAL = number (matches SQL)
  title: string;
  slug: string;
  description?: string;
  category?: string;
  theme?: string;
  tags: string[];
  difficulty?: "easy" | "medium" | "hard"; // Matches actual constraint
  question_data: TriviaQuestionData[];
  question_count: number; // Must be > 0 (has check constraint)
  status: "draft" | "scheduled" | "published"; // Matches actual constraint (no 'archived')
  visibility: "Public" | "Unlisted" | "Private"; // Matches actual constraint, defaults to 'Private'
  published_at?: string; // TIMESTAMPTZ
  scheduled_for?: string; // TIMESTAMPTZ (required if status='scheduled')
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
  difficulty?: "easy" | "medium" | "hard";
  question_count: number; // Must be > 0
  question_data: TriviaQuestionData[];
  status?: "draft" | "scheduled" | "published";
  visibility?: "Public" | "Unlisted" | "Private";
  published_at?: string;
  scheduled_for?: string; // Required if status='scheduled'
}

// Types for source_content_ingested table (new workflow system)
export type SourceContentCategory =
  // Players theme categories
  | "Player Spotlight"
  | "Sharpshooters"
  | "Net Minders"
  | "Icons"
  | "Captains"
  | "Hockey is Family"
  // Teams & Organizations theme categories
  | "Stanley Cup Playoffs"
  | "NHL Draft"
  | "Free Agency"
  | "Game Day"
  | "Hockey Nations"
  | "All-Star Game"
  | "Heritage Classic"
  // Venues & Locations theme categories
  | "Stadium Series"
  | "Global Series"
  // Awards & Honors theme categories
  | "NHL Awards"
  | "Milestones"
  // Leadership & Staff theme categories
  | "Coaching"
  | "Management"
  | "Front Office";

export type IngestionStatus = "draft" | "validated" | "enriched" | "complete";

export interface SourceContentIngested {
  id: number; // BIGSERIAL
  content_text: string;
  word_count?: number;
  char_count?: number;

  // AI-extracted metadata
  theme: Theme; // Required - must be one of 5 standardized themes
  tags?: string[]; // Rich tag fabric
  category?: SourceContentCategory; // Theme-specific category refinement
  summary?: string; // AI-generated summary
  title?: string; // AI-generated title
  key_phrases?: string[]; // Key phrases extracted by AI
  metadata?: Record<string, unknown>; // Additional metadata (JSONB)

  // Usage tracking
  used_for?: string[]; // Array tracking usage: 'multiple-choice', 'true-false', 'who-am-i', 'stat', 'motivational', 'greeting', 'wisdom'

  // Workflow tracking
  ingestion_process_id?: string; // Link to process execution
  ingestion_status: IngestionStatus;

  // Timestamps
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface CreateSourceContentIngested {
  content_text: string;
  word_count?: number;
  char_count?: number;
  theme: Theme; // Required
  tags?: string[];
  category?: SourceContentCategory;
  summary?: string;
  title?: string;
  key_phrases?: string[];
  metadata?: Record<string, unknown>;
  ingestion_process_id?: string;
  ingestion_status?: IngestionStatus; // Defaults to 'draft'
}

export interface UpdateSourceContentIngested {
  content_text?: string;
  word_count?: number;
  char_count?: number;
  theme?: Theme;
  tags?: string[];
  category?: SourceContentCategory;
  summary?: string;
  title?: string;
  key_phrases?: string[];
  metadata?: Record<string, unknown>;
  ingestion_process_id?: string;
  ingestion_status?: IngestionStatus;
}

// Types for ai_extraction_prompts table
export type PromptType = "metadata_extraction" | "content_enrichment";

export interface AIExtractionPrompt {
  id: number; // BIGSERIAL
  prompt_name: string;
  prompt_type: PromptType;
  prompt_content: string;
  description?: string;
  is_active: boolean;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  created_by?: string; // UUID (references auth.users)
}

export interface CreateAIExtractionPrompt {
  prompt_name: string;
  prompt_type: PromptType;
  prompt_content: string;
  description?: string;
  is_active?: boolean; // Defaults to true
}

export interface UpdateAIExtractionPrompt {
  prompt_name?: string;
  prompt_type?: PromptType;
  prompt_content?: string;
  description?: string;
  is_active?: boolean;
}
