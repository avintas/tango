// =============================================================================
// RECIPE EXECUTOR
// =============================================================================
//
// Client-side execution utilities for recipes
// Handles recipe execution and preview
//
// Created: January 15, 2025
//
// =============================================================================

import {
  Recipe,
  RecipeCreateInput,
  RecipeExecutionRequest,
  RecipeExecutionResult,
} from "./types";

/**
 * Execute a recipe to build a trivia set
 *
 * @param recipeId - ID of recipe to execute
 * @param options - Optional execution options
 * @returns Promise with execution result
 */
export async function executeRecipe(
  recipeId: number,
  options?: {
    quantity?: number; // Override default quantity
    allowPartialSets?: boolean; // Allow partial sets if not enough questions
  },
): Promise<RecipeExecutionResult> {
  try {
    const requestBody: RecipeExecutionRequest = {
      recipeId,
      quantity: options?.quantity,
      allowPartialSets: options?.allowPartialSets,
    };

    const response = await fetch("/api/trivia-sets/build-from-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to execute recipe",
        questionsRequested: options?.quantity,
        questionsSelected: 0,
      };
    }

    return result as RecipeExecutionResult;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to execute recipe",
      questionsRequested: options?.quantity,
      questionsSelected: 0,
    };
  }
}

/**
 * Execute an inline recipe (not stored in database)
 *
 * @param recipe - Recipe object to execute
 * @param options - Optional execution options
 * @returns Promise with execution result
 */
export async function executeInlineRecipe(
  recipe: RecipeCreateInput,
  options?: {
    quantity?: number; // Override default quantity
  },
): Promise<RecipeExecutionResult> {
  try {
    const requestBody: RecipeExecutionRequest = {
      recipe,
      quantity: options?.quantity,
    };

    const response = await fetch("/api/trivia-sets/build-from-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to execute recipe",
        questionsRequested: options?.quantity || recipe.quantity.default,
        questionsSelected: 0,
      };
    }

    return result as RecipeExecutionResult;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to execute recipe",
      questionsRequested: options?.quantity || recipe.quantity.default,
      questionsSelected: 0,
    };
  }
}

/**
 * Preview what a recipe would select
 *
 * Fetches stats for the recipe's category to show what would be available
 * This is a preview - doesn't actually execute the recipe
 *
 * @param recipe - Recipe to preview
 * @returns Promise with preview information
 */
export async function previewRecipe(recipe: {
  category: string;
  questionTypes: string[];
  quantity: { default: number };
  cooldown: { days: number | null; enabled: boolean };
}): Promise<{
  success: boolean;
  available?: number;
  wouldSelect?: number;
  error?: string;
}> {
  try {
    // Get stats for the category
    const response = await fetch(
      `/api/recipes/stats?category=${encodeURIComponent(recipe.category)}`,
    );

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to fetch category stats",
      };
    }

    const statsResult = await response.json();

    if (!statsResult.success || !statsResult.data) {
      return {
        success: false,
        error: "No stats available for this category",
      };
    }

    const stats = statsResult.data;

    // Calculate available questions for requested types
    let available = 0;
    for (const type of recipe.questionTypes) {
      const typeKey = type as keyof typeof stats.questionCounts;
      available += stats.questionCounts[typeKey] || 0;
    }

    // Note: This is a simplified preview - doesn't account for cooldown filtering
    // Full preview would require more complex logic
    const wouldSelect = Math.min(available, recipe.quantity.default);

    return {
      success: true,
      available,
      wouldSelect,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to preview recipe",
    };
  }
}

/**
 * Load recipe by ID
 *
 * @param recipeId - ID of recipe to load
 * @returns Promise with recipe or null if not found
 */
export async function loadRecipe(recipeId: number): Promise<Recipe | null> {
  try {
    const response = await fetch(`/api/recipes/${recipeId}`);

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return null;
    }

    return result.data as Recipe;
  } catch (error) {
    console.error("Error loading recipe:", error);
    return null;
  }
}

/**
 * List all recipes
 *
 * @param filters - Optional filters
 * @returns Promise with array of recipes
 */
export async function listRecipes(filters?: {
  category?: string;
  theme?: string;
  bagType?: string;
  executionMode?: string;
  limit?: number;
  offset?: number;
}): Promise<{ recipes: Recipe[]; count: number }> {
  try {
    const params = new URLSearchParams();

    if (filters?.category) {
      params.append("category", filters.category);
    }
    if (filters?.theme) {
      params.append("theme", filters.theme);
    }
    if (filters?.bagType) {
      params.append("bagType", filters.bagType);
    }
    if (filters?.executionMode) {
      params.append("executionMode", filters.executionMode);
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    }
    if (filters?.offset) {
      params.append("offset", filters.offset.toString());
    }

    const url = `/api/recipes${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      return { recipes: [], count: 0 };
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return { recipes: [], count: 0 };
    }

    return {
      recipes: Array.isArray(result.data) ? result.data : [result.data],
      count: result.count || 0,
    };
  } catch (error) {
    console.error("Error listing recipes:", error);
    return { recipes: [], count: 0 };
  }
}
