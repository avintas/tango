/**
 * Unified Content System - TypeScript Types
 * Single source of truth for all content types (greetings, motivational, wisdom, statistics)
 */

// =====================================================================
// ENUMS & CONSTANTS
// =====================================================================

/**
 * Content type discriminator
 */
export type ContentType = "greeting" | "motivational" | "wisdom" | "statistic";

/**
 * Array of all valid content types
 */
export const CONTENT_TYPES: ContentType[] = [
  "greeting",
  "motivational",
  "wisdom",
  "statistic",
];

// =====================================================================
// CORE INTERFACES
// =====================================================================

/**
 * Base content interface matching the database schema
 */
export interface Content {
  id: number;
  content_type: ContentType;
  content_text: string;
  content_title?: string | null; // 3-4 word title (all types)
  musings?: string | null; // Philosophical quote (wisdom only)
  from_the_box?: string | null; // Penalty box commentary (wisdom only)
  source_content_id: number | null;
  used_in: string[];
  theme: string | null;
  attribution: string | null;
  category: string | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Alias for Content - used throughout the codebase
 */
export type UniContent = Content;

/**
 * Content without ID (for creation)
 */
export interface NewContent {
  content_type: ContentType;
  content_text: string;
  content_title?: string | null;
  musings?: string | null;
  from_the_box?: string | null;
  source_content_id?: number | null;
  used_in?: string[];
  theme?: string | null;
  attribution?: string | null;
  category?: string | null;
  status?: string | null;
}

/**
 * Content update (partial, with required ID)
 */
export interface ContentUpdate {
  id: number;
  content_text?: string;
  used_in?: string[];
  theme?: string | null;
  attribution?: string | null;
  category?: string | null;
}

// =====================================================================
// TYPE-SPECIFIC INTERFACES (for better type safety)
// =====================================================================

/**
 * Greeting content
 */
export interface GreetingContent
  extends Omit<Content, "content_type" | "attribution" | "category"> {
  content_type: "greeting";
  theme: string | null;
}

/**
 * Motivational content
 */
export interface MotivationalContent
  extends Omit<Content, "content_type" | "theme" | "category"> {
  content_type: "motivational";
  attribution: string | null;
}

/**
 * Wisdom content
 */
export interface WisdomContent
  extends Omit<Content, "content_type" | "attribution" | "category"> {
  content_type: "wisdom";
  theme: string | null;
}

/**
 * Statistic content
 */
export interface StatisticContent
  extends Omit<Content, "content_type" | "theme" | "attribution"> {
  content_type: "statistic";
  category: string | null;
}

// =====================================================================
// API REQUEST/RESPONSE TYPES
// =====================================================================

/**
 * Request to save new content
 */
export interface SaveContentRequest {
  content: NewContent;
}

/**
 * Response from save content
 */
export interface SaveContentResponse {
  success: boolean;
  data?: Content;
  error?: string;
}

/**
 * Request to fetch content (with filters)
 */
export interface FetchContentRequest {
  content_type?: ContentType;
  source_content_id?: number;
  limit?: number;
  offset?: number;
}

/**
 * Response from fetch content
 */
export interface FetchContentResponse {
  success: boolean;
  data?: Content[];
  total?: number;
  error?: string;
}

/**
 * Request to update content
 */
export interface UpdateContentRequest {
  content: ContentUpdate;
}

/**
 * Response from update content
 */
export interface UpdateContentResponse {
  success: boolean;
  data?: Content;
  error?: string;
}

/**
 * Request to delete content
 */
export interface DeleteContentRequest {
  id: number;
}

/**
 * Response from delete content
 */
export interface DeleteContentResponse {
  success: boolean;
  error?: string;
}

// =====================================================================
// TYPE GUARDS
// =====================================================================

/**
 * Check if a string is a valid ContentType
 */
export function isContentType(value: string): value is ContentType {
  return CONTENT_TYPES.includes(value as ContentType);
}

/**
 * Check if content is a greeting
 */
export function isGreetingContent(
  content: Content,
): content is GreetingContent {
  return content.content_type === "greeting";
}

/**
 * Check if content is motivational
 */
export function isMotivationalContent(
  content: Content,
): content is MotivationalContent {
  return content.content_type === "motivational";
}

/**
 * Check if content is wisdom
 */
export function isWisdomContent(content: Content): content is WisdomContent {
  return content.content_type === "wisdom";
}

/**
 * Check if content is a statistic
 */
export function isStatisticContent(
  content: Content,
): content is StatisticContent {
  return content.content_type === "statistic";
}

// =====================================================================
// HELPER TYPES
// =====================================================================

/**
 * Content grouped by type
 */
export interface ContentByType {
  greeting: GreetingContent[];
  motivational: MotivationalContent[];
  wisdom: WisdomContent[];
  statistic: StatisticContent[];
}

/**
 * Content statistics
 */
export interface ContentStats {
  total: number;
  by_type: {
    [K in ContentType]: number;
  };
}

export interface TriviaSet {
  // ... fields for TriviaSet
}

export interface IngestedContent {
  id: number;
  title: string;
  content_text: string;
  status: "ready" | "processing" | "completed" | "failed";
}

export interface GenerationJob {
  id: number;
  content_type: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  source_content_id: number;
}
