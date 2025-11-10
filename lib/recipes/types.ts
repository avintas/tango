// =============================================================================
// RECIPE TYPES
// =============================================================================
//
// Type definitions for Recipe system
// Database table: trivia_sets_recipes
// Pattern: Recipe templates for trivia set building
//
// Created: January 15, 2025
//
// =============================================================================

/**
 * Recipe - Full database record with all fields
 *
 * Reusable template for building trivia sets
 * Database table: trivia_sets_recipes
 */
export interface Recipe {
  id: number;

  // Basic information
  name: string;
  description?: string | null;

  // Recipe parameters (Category-bound selection)
  category: string; // Lighthouse/beacon - primary selector
  theme?: string | null; // Reference only, not a filter
  questionTypes: ("multiple-choice" | "true-false" | "who-am-i")[];
  bagType: "category-bound-mc" | "category-bound-tf" | "category-bound-mix";

  // Quantity parameters
  quantity: {
    min: number; // 1-20
    max: number; // 1-20
    default: number; // Between min and max
  };

  // Cooldown parameters
  cooldown: {
    days: number | null; // Flexible, not fixed
    enabled: boolean;
  };

  // Selection parameters
  selectionMethod: "random";

  // Execution mode
  executionMode: "auto" | "manual";

  // Metadata & tracking
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  usageCount: number;
  lastUsedAt?: string | null;
}

/**
 * RecipeCreateInput - Input for creating new recipe
 *
 * Only required and commonly-provided fields
 */
export interface RecipeCreateInput {
  name: string;
  description?: string | null;
  category: string;
  theme?: string | null;
  questionTypes: ("multiple-choice" | "true-false" | "who-am-i")[];
  bagType: "category-bound-mc" | "category-bound-tf" | "category-bound-mix";
  quantity: {
    min: number;
    max: number;
    default: number;
  };
  cooldown: {
    days: number | null;
    enabled: boolean;
  };
  selectionMethod?: "random";
  executionMode?: "auto" | "manual";
  createdBy?: string | null;
}

/**
 * RecipeUpdateInput - Input for updating recipe
 *
 * All fields optional (partial update)
 */
export interface RecipeUpdateInput {
  name?: string;
  description?: string | null;
  category?: string;
  theme?: string | null;
  questionTypes?: ("multiple-choice" | "true-false" | "who-am-i")[];
  bagType?: "category-bound-mc" | "category-bound-tf" | "category-bound-mix";
  quantity?: {
    min: number;
    max: number;
    default: number;
  };
  cooldown?: {
    days: number | null;
    enabled: boolean;
  };
  selectionMethod?: "random";
  executionMode?: "auto" | "manual";
}

/**
 * RecipeQueryParams - Query parameters for fetching recipes
 *
 * Used in API routes for filtering and pagination
 */
export interface RecipeQueryParams {
  category?: string;
  theme?: string;
  bagType?: "category-bound-mc" | "category-bound-tf" | "category-bound-mix";
  executionMode?: "auto" | "manual";
  limit?: number;
  offset?: number;
}

/**
 * RecipeApiResponse - API Response wrapper for Recipe
 *
 * Standard response format for all Recipe API endpoints
 */
export interface RecipeApiResponse {
  success: boolean;
  data?: Recipe | Recipe[];
  count?: number;
  error?: string;
}

/**
 * RecipeStats - Statistics for a category
 *
 * Used by ideation and recipe exploration
 */
export interface RecipeStats {
  category: string;
  theme?: string | null;
  questionCounts: {
    "multiple-choice": number;
    "true-false": number;
    "who-am-i": number;
  };
  totalAvailable: number;
  byDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  recentUsage: {
    last7Days: number;
    last30Days: number;
  };
}

/**
 * RecipeExecutionRequest - Request to execute a recipe
 */
export interface RecipeExecutionRequest {
  recipeId?: number; // If executing existing recipe
  recipe?: RecipeCreateInput; // If executing inline recipe
  quantity?: number; // Override default quantity
  allowPartialSets?: boolean; // Allow creating set with fewer questions if not enough available
}

/**
 * RecipeExecutionResult - Result of recipe execution
 */
export interface RecipeExecutionResult {
  success: boolean;
  triviaSetId?: number;
  questionsSelected: number;
  questionsRequested: number;
  warnings?: string[];
  error?: string;
}

// =============================================================================
// TYPE GUARDS & VALIDATION
// =============================================================================

/**
 * Valid bag types
 */
export const BAG_TYPES = [
  "category-bound-mc",
  "category-bound-tf",
  "category-bound-mix",
] as const;

/**
 * Valid question types
 */
export const QUESTION_TYPES = [
  "multiple-choice",
  "true-false",
  "who-am-i",
] as const;

/**
 * Valid execution modes
 */
export const EXECUTION_MODES = ["auto", "manual"] as const;

/**
 * Type guard: Check if value is valid bag type
 */
export function isValidBagType(
  value: any,
): value is "category-bound-mc" | "category-bound-tf" | "category-bound-mix" {
  return BAG_TYPES.includes(value);
}

/**
 * Type guard: Check if value is valid question type
 */
export function isValidQuestionType(
  value: any,
): value is "multiple-choice" | "true-false" | "who-am-i" {
  return QUESTION_TYPES.includes(value);
}

/**
 * Type guard: Check if value is valid execution mode
 */
export function isValidExecutionMode(value: any): value is "auto" | "manual" {
  return EXECUTION_MODES.includes(value);
}

/**
 * Determine bag type from question types
 *
 * Auto-determines bag type based on question types:
 * - Single MC type → category-bound-mc
 * - Single TF type → category-bound-tf
 * - Multiple types → category-bound-mix
 */
export function determineBagType(
  questionTypes: ("multiple-choice" | "true-false" | "who-am-i")[],
): "category-bound-mc" | "category-bound-tf" | "category-bound-mix" {
  if (questionTypes.length === 0) {
    throw new Error("At least one question type is required");
  }

  if (questionTypes.length === 1) {
    if (questionTypes[0] === "multiple-choice") {
      return "category-bound-mc";
    }
    if (questionTypes[0] === "true-false") {
      return "category-bound-tf";
    }
    // who-am-i alone could be category-bound-mix or we could add a new bag type
    // For now, treat as mix
    return "category-bound-mix";
  }

  // Multiple types = mix
  return "category-bound-mix";
}

/**
 * Validate Recipe input
 *
 * Ensures all required fields are present and valid
 */
export function validateRecipeInput(input: Partial<RecipeCreateInput>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.name || input.name.trim() === "") {
    errors.push("name is required");
  }

  if (!input.category || input.category.trim() === "") {
    errors.push("category is required");
  }

  if (!input.questionTypes || !Array.isArray(input.questionTypes)) {
    errors.push("questionTypes must be an array");
  } else if (input.questionTypes.length === 0) {
    errors.push("At least one question type is required");
  } else {
    const invalidTypes = input.questionTypes.filter(
      (t) => !isValidQuestionType(t),
    );
    if (invalidTypes.length > 0) {
      errors.push(
        `Invalid question types: ${invalidTypes.join(", ")}. Must be one of: ${QUESTION_TYPES.join(", ")}`,
      );
    }
  }

  if (input.bagType && !isValidBagType(input.bagType)) {
    errors.push(`bagType must be one of: ${BAG_TYPES.join(", ")}`);
  }

  if (input.quantity) {
    if (
      typeof input.quantity.min !== "number" ||
      input.quantity.min < 1 ||
      input.quantity.min > 20
    ) {
      errors.push("quantity.min must be between 1 and 20");
    }
    if (
      typeof input.quantity.max !== "number" ||
      input.quantity.max < 1 ||
      input.quantity.max > 20
    ) {
      errors.push("quantity.max must be between 1 and 20");
    }
    if (
      typeof input.quantity.default !== "number" ||
      input.quantity.default < input.quantity.min ||
      input.quantity.default > input.quantity.max
    ) {
      errors.push(
        "quantity.default must be between quantity.min and quantity.max",
      );
    }
  }

  if (input.cooldown) {
    if (
      input.cooldown.days !== null &&
      (typeof input.cooldown.days !== "number" || input.cooldown.days < 0)
    ) {
      errors.push("cooldown.days must be a non-negative number or null");
    }
  }

  if (input.executionMode && !isValidExecutionMode(input.executionMode)) {
    errors.push(`executionMode must be one of: ${EXECUTION_MODES.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
