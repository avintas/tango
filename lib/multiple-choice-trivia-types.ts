// =============================================================================
// MULTIPLE CHOICE TRIVIA TYPES
// =============================================================================
//
// Type definitions for Multiple Choice Trivia content type
// Database table: multiple_choice_trivia
// Pattern: Content Library Table Pattern
//
// Created: October 30, 2025
//
// =============================================================================

/**
 * Multiple Choice Trivia Question
 *
 * Full database record with all fields
 */
export interface MultipleChoiceTrivia {
  id: number;

  // Content-specific fields
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation: string | null;

  // Standard metadata fields
  category: string | null;
  theme: string | null;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  tags: string[] | null;
  attribution: string | null;

  // Standard workflow & tracking fields
  status: "draft" | "published" | "archived" | null;
  used_in: string[] | null;
  source_content_id: number | null;
  display_order: number | null;

  // Standard timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
  archived_at: string | null;
}

/**
 * Input for creating new Multiple Choice Trivia
 *
 * Only required and commonly-provided fields
 */
export interface MultipleChoiceTriviaCreateInput {
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation?: string | null;
  category?: string | null;
  theme?: string | null;
  difficulty?: "Easy" | "Medium" | "Hard" | null;
  tags?: string[] | null;
  attribution?: string | null;
  status?: "draft" | "published" | "archived";
  source_content_id?: number | null;
}

/**
 * Input for updating Multiple Choice Trivia
 *
 * All fields optional (partial update)
 */
export interface MultipleChoiceTriviaUpdateInput {
  question_text?: string;
  correct_answer?: string;
  wrong_answers?: string[];
  explanation?: string | null;
  category?: string | null;
  theme?: string | null;
  difficulty?: "Easy" | "Medium" | "Hard" | null;
  tags?: string[] | null;
  attribution?: string | null;
  status?: "draft" | "published" | "archived" | null;
  used_in?: string[] | null;
  display_order?: number | null;
}

/**
 * Query parameters for fetching Multiple Choice Trivia
 *
 * Used in API routes for filtering and pagination
 */
export interface MultipleChoiceTriviaFetchParams {
  theme?: string;
  category?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  status?: "draft" | "published" | "archived";
  limit?: number;
  offset?: number;
}

/**
 * API Response wrapper for Multiple Choice Trivia
 *
 * Standard response format for all Multiple Choice Trivia API endpoints
 */
export interface MultipleChoiceTriviaApiResponse {
  success: boolean;
  data?: MultipleChoiceTrivia | MultipleChoiceTrivia[];
  count?: number;
  error?: string;
}

/**
 * Public API Response (for omnipaki.com)
 *
 * Simplified response with only public-facing fields
 */
export interface PublicMultipleChoiceTriviaResponse {
  id: number;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation: string | null;
  category: string | null;
  theme: string | null;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  attribution: string | null;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Difficulty levels as const array (for validation)
 */
export const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"] as const;

/**
 * Status values as const array (for validation)
 */
export const STATUS_VALUES = ["draft", "published", "archived"] as const;

/**
 * Type guard: Check if value is valid difficulty
 */
export function isValidDifficulty(
  value: any,
): value is "Easy" | "Medium" | "Hard" {
  return DIFFICULTY_LEVELS.includes(value);
}

/**
 * Type guard: Check if value is valid status
 */
export function isValidStatus(
  value: any,
): value is "draft" | "published" | "archived" {
  return STATUS_VALUES.includes(value);
}

/**
 * Validate Multiple Choice Trivia input
 *
 * Ensures wrong_answers has exactly 3 items
 */
export function validateMultipleChoiceTriviaInput(
  input: Partial<MultipleChoiceTriviaCreateInput>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.question_text || input.question_text.trim() === "") {
    errors.push("question_text is required");
  }

  if (!input.correct_answer || input.correct_answer.trim() === "") {
    errors.push("correct_answer is required");
  }

  if (!input.wrong_answers || !Array.isArray(input.wrong_answers)) {
    errors.push("wrong_answers must be an array");
  } else if (input.wrong_answers.length !== 3) {
    errors.push("wrong_answers must contain exactly 3 items");
  } else if (input.wrong_answers.some((ans) => !ans || ans.trim() === "")) {
    errors.push("All wrong_answers must be non-empty strings");
  }

  if (input.difficulty && !isValidDifficulty(input.difficulty)) {
    errors.push(`difficulty must be one of: ${DIFFICULTY_LEVELS.join(", ")}`);
  }

  if (input.status && !isValidStatus(input.status)) {
    errors.push(`status must be one of: ${STATUS_VALUES.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*

// Creating a new multiple choice question
const newQuestion: MultipleChoiceTriviaCreateInput = {
  question_text: "Who holds the record for most career goals in the NHL?",
  correct_answer: "Wayne Gretzky",
  wrong_answers: ["Mario Lemieux", "Gordie Howe", "Alex Ovechkin"],
  explanation: "Wayne Gretzky scored 894 goals in his NHL career.",
  theme: "Hockey History",
  difficulty: "Easy",
  tags: ["records", "scoring", "legends"],
  status: "published"
};

// Validate before saving
const validation = validateMultipleChoiceTriviaInput(newQuestion);
if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
}

// Fetching multiple choice questions
const params: MultipleChoiceTriviaFetchParams = {
  theme: "Hockey History",
  difficulty: "Easy",
  status: "published",
  limit: 20,
  offset: 0
};

// Type guard usage
const difficulty = "Easy";
if (isValidDifficulty(difficulty)) {
  // TypeScript knows difficulty is 'Easy' | 'Medium' | 'Hard'
  console.log(`Valid difficulty: ${difficulty}`);
}

*/
