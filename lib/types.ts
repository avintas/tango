/**
 * Tango CMS - TypeScript Type Definitions
 * Clean, minimal types based on actual system usage
 * Last updated: 2025-10-30
 */

// ========================================================================
// CONTENT TYPES
// ========================================================================

/**
 * All valid content types in the system
 * Collection types save to dedicated tables (collection_*)
 * Trivia types save to dedicated trivia tables (trivia_multiple_choice, true_false_trivia, trivia_who_am_i)
 */
export type ContentType =
  // Collection content types
  | "stat"
  | "greeting"
  | "motivational"
  | "wisdom"
  // Trivia question types
  | "multiple-choice"
  | "true-false"
  | "who-am-i";

/**
 * Array of all content types (for validation/iteration)
 */
export const ALL_CONTENT_TYPES: ContentType[] = [
  "stat",
  "greeting",
  "motivational",
  "wisdom",
  "multiple-choice",
  "true-false",
  "who-am-i",
];

/**
 * Collection content types only (not trivia)
 */
export const COLLECTION_TYPES: ContentType[] = [
  "stat",
  "greeting",
  "motivational",
  "wisdom",
];

/**
 * Trivia question types only
 */
export const TRIVIA_TYPES: ContentType[] = [
  "multiple-choice",
  "true-false",
  "who-am-i",
];

// ========================================================================
// COLLECTION CONTENT (Stats, Greetings, Motivational, Wisdom)
// ========================================================================

/**
 * Content for collection tables (collection_stats, collection_greetings, etc.)
 * This is the structure used by Gemini generation and content save endpoints
 *
 * Different content types use different fields:
 * - stat: content_text, stat_value, stat_category, year, theme, category
 * - greeting: content_text, attribution
 * - motivational: content_text, author, context, attribution
 * - wisdom: content_title, musings, from_the_box, theme, attribution
 */
export interface CollectionContent {
  // Core fields (all types)
  content_type: "stat" | "greeting" | "motivational" | "wisdom";
  content_text: string;

  // Stat-specific fields
  stat_value?: string | null;
  stat_category?: string | null;
  year?: number | null;

  // Motivational-specific fields
  author?: string | null;
  context?: string | null;

  // Wisdom-specific fields
  content_title?: string | null;
  musings?: string | null;
  from_the_box?: string | null;

  // Common metadata (all types can have these)
  theme?: string | null;
  category?: string | null;
  attribution?: string | null;
}

// ========================================================================
// TRIVIA QUESTIONS
// ========================================================================

/**
 * Trivia question structure
 * Used by Gemini generation and trivia save endpoints
 * Saves to: trivia_questions table
 */
export interface TriviaQuestion {
  question_type: "multiple-choice" | "true-false" | "who-am-i";
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation?: string | null;
  theme?: string | null;

  // Optional fields (set by system, not required from generation)
  id?: number;
  category?: string | null;
  difficulty?: string | null;
  source_content_id?: number | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ========================================================================
// TYPE GUARDS & HELPERS
// ========================================================================

/**
 * Check if a string is a valid ContentType
 */
export function isContentType(value: string): value is ContentType {
  return ALL_CONTENT_TYPES.includes(value as ContentType);
}

/**
 * Check if content type is a collection type (not trivia)
 */
export function isCollectionType(value: ContentType): boolean {
  return COLLECTION_TYPES.includes(value);
}

/**
 * Check if content type is a trivia type
 */
export function isTriviaType(value: ContentType): boolean {
  return TRIVIA_TYPES.includes(value);
}

/**
 * Get the database table name for a content type
 */
export function getTableName(contentType: ContentType): string {
  const tableMap: Record<ContentType, string> = {
    stat: "collection_stats",
    greeting: "collection_greetings",
    motivational: "collection_motivational",
    wisdom: "collection_wisdom",
    "multiple-choice": "trivia_multiple_choice",
    "true-false": "true_false_trivia",
    "who-am-i": "trivia_who_am_i",
  };
  return tableMap[contentType];
}

// ========================================================================
// LEGACY EXPORTS (for backward compatibility)
// ========================================================================

/**
 * @deprecated Use TriviaQuestion directly
 * Legacy alias - kept for backward compatibility with existing code
 */
export type Question = TriviaQuestion;

/**
 * Array of content types (legacy name)
 * @deprecated Use ALL_CONTENT_TYPES instead
 */
export const CONTENT_TYPES = ALL_CONTENT_TYPES;

// ========================================================================
// CMS & APP-SPECIFIC TYPES
// ========================================================================

/**
 * Structure for trivia categories
 * Saves to: categories table
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  emoji?: string | null;
  is_active: boolean;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}
