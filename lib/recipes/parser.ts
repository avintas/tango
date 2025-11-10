// =============================================================================
// RECIPE PARSER
// =============================================================================
//
// Client-side parsing utilities for recipes
// Converts form data to structured RecipeCreateInput
// Validates recipes before submission
//
// Created: January 15, 2025
//
// =============================================================================

import {
  RecipeCreateInput,
  RecipeUpdateInput,
  validateRecipeInput,
  determineBagType,
} from "./types";

/**
 * Form data structure from UI form
 */
export interface RecipeFormData {
  name: string;
  description?: string;
  category: string;
  theme?: string;
  questionTypes: string[]; // Array of checkbox values
  quantityMin: number;
  quantityMax: number;
  quantityDefault: number;
  cooldownDays: number | null;
  cooldownEnabled: boolean;
  executionMode: "auto" | "manual";
}

/**
 * Parse form data into RecipeCreateInput
 *
 * Converts UI form data to structured recipe input
 * Auto-determines bag type from question types
 */
export function parseRecipeForm(formData: RecipeFormData): RecipeCreateInput {
  // Normalize question types
  const questionTypes: ("multiple-choice" | "true-false" | "who-am-i")[] =
    formData.questionTypes
      .map((type) => {
        // Handle various input formats
        if (type === "TMC" || type === "multiple-choice") {
          return "multiple-choice";
        }
        if (type === "TFT" || type === "true-false") {
          return "true-false";
        }
        if (type === "WAI" || type === "who-am-i") {
          return "who-am-i";
        }
        return null;
      })
      .filter(
        (type): type is "multiple-choice" | "true-false" | "who-am-i" =>
          type !== null,
      );

  // Auto-determine bag type
  const bagType = determineBagType(questionTypes);

  return {
    name: formData.name.trim(),
    description: formData.description?.trim() || null,
    category: formData.category.trim(),
    theme: formData.theme?.trim() || null,
    questionTypes,
    bagType,
    quantity: {
      min: formData.quantityMin,
      max: formData.quantityMax,
      default: formData.quantityDefault,
    },
    cooldown: {
      days: formData.cooldownDays,
      enabled: formData.cooldownEnabled,
    },
    selectionMethod: "random",
    executionMode: formData.executionMode,
  };
}

/**
 * Parse form data into RecipeUpdateInput (for updates)
 *
 * Similar to parseRecipeForm but returns partial update input
 */
export function parseRecipeUpdateForm(
  formData: Partial<RecipeFormData>,
): RecipeUpdateInput {
  const update: RecipeUpdateInput = {};

  if (formData.name !== undefined) {
    update.name = formData.name.trim();
  }

  if (formData.description !== undefined) {
    update.description = formData.description?.trim() || null;
  }

  if (formData.category !== undefined) {
    update.category = formData.category.trim();
  }

  if (formData.theme !== undefined) {
    update.theme = formData.theme?.trim() || null;
  }

  if (formData.questionTypes !== undefined) {
    const questionTypes: ("multiple-choice" | "true-false" | "who-am-i")[] =
      formData.questionTypes
        .map((type) => {
          if (type === "TMC" || type === "multiple-choice") {
            return "multiple-choice";
          }
          if (type === "TFT" || type === "true-false") {
            return "true-false";
          }
          if (type === "WAI" || type === "who-am-i") {
            return "who-am-i";
          }
          return null;
        })
        .filter(
          (type): type is "multiple-choice" | "true-false" | "who-am-i" =>
            type !== null,
        );

    update.questionTypes = questionTypes;
    // Auto-determine bag type if question types changed
    update.bagType = determineBagType(questionTypes);
  }

  if (
    formData.quantityMin !== undefined ||
    formData.quantityMax !== undefined ||
    formData.quantityDefault !== undefined
  ) {
    update.quantity = {
      min: formData.quantityMin ?? 1,
      max: formData.quantityMax ?? 20,
      default: formData.quantityDefault ?? 10,
    };
  }

  if (
    formData.cooldownDays !== undefined ||
    formData.cooldownEnabled !== undefined
  ) {
    update.cooldown = {
      days: formData.cooldownDays ?? null,
      enabled: formData.cooldownEnabled ?? true,
    };
  }

  if (formData.executionMode !== undefined) {
    update.executionMode = formData.executionMode;
  }

  return update;
}

/**
 * Validate recipe form data
 *
 * Returns validation result with errors if any
 */
export function validateRecipeForm(formData: RecipeFormData): {
  valid: boolean;
  errors: string[];
} {
  const recipeInput = parseRecipeForm(formData);
  return validateRecipeInput(recipeInput);
}

/**
 * Format recipe for display
 *
 * Converts Recipe to human-readable format for UI
 */
export function formatRecipeForDisplay(recipe: {
  name: string;
  category: string;
  theme?: string | null;
  questionTypes: string[];
  quantity: { min: number; max: number; default: number };
  cooldown: { days: number | null; enabled: boolean };
  executionMode: string;
}): string {
  const typeLabels: Record<string, string> = {
    "multiple-choice": "Multiple Choice",
    "true-false": "True/False",
    "who-am-i": "Who Am I",
  };

  const questionTypesLabel = recipe.questionTypes
    .map((type) => typeLabels[type] || type)
    .join(", ");

  const cooldownLabel = recipe.cooldown.enabled
    ? `${recipe.cooldown.days} days`
    : "No cooldown";

  return `${recipe.name}
Category: ${recipe.category}
${recipe.theme ? `Theme: ${recipe.theme}` : ""}
Types: ${questionTypesLabel}
Quantity: ${recipe.quantity.min}-${recipe.quantity.max} (default: ${recipe.quantity.default})
Cooldown: ${cooldownLabel}
Mode: ${recipe.executionMode === "auto" ? "Automated" : "Manual"}`;
}

/**
 * Convert Recipe to form data
 *
 * Useful for populating edit forms
 */
export function recipeToFormData(recipe: {
  name: string;
  description?: string | null;
  category: string;
  theme?: string | null;
  questionTypes: string[];
  quantity: { min: number; max: number; default: number };
  cooldown: { days: number | null; enabled: boolean };
  executionMode: string;
}): RecipeFormData {
  return {
    name: recipe.name,
    description: recipe.description || undefined,
    category: recipe.category,
    theme: recipe.theme || undefined,
    questionTypes: recipe.questionTypes,
    quantityMin: recipe.quantity.min,
    quantityMax: recipe.quantity.max,
    quantityDefault: recipe.quantity.default,
    cooldownDays: recipe.cooldown.days,
    cooldownEnabled: recipe.cooldown.enabled,
    executionMode: recipe.executionMode as "auto" | "manual",
  };
}
