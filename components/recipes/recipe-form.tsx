"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import {
  parseRecipeForm,
  validateRecipeForm,
  recipeToFormData,
  type RecipeFormData,
} from "@/lib/recipes/parser";
import type { Recipe, RecipeCreateInput } from "@/lib/recipes/types";

interface RecipeFormProps {
  recipe?: Recipe; // If provided, form is in edit mode
  onSubmit: (recipe: RecipeCreateInput) => Promise<void>;
  onCancel?: () => void;
}

// Standardized themes
const THEMES = [
  "Players",
  "Teams & Organizations",
  "Venues & Locations",
  "Awards & Honors",
  "Leadership & Staff",
] as const;

// Question type options
const QUESTION_TYPE_OPTIONS = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false", label: "True/False" },
  { value: "who-am-i", label: "Who Am I" },
] as const;

export default function RecipeForm({
  recipe,
  onSubmit,
  onCancel,
}: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    name: "",
    description: "",
    category: "",
    theme: "",
    questionTypes: [],
    quantityMin: 1,
    quantityMax: 20,
    quantityDefault: 10,
    cooldownDays: 7,
    cooldownEnabled: true,
    executionMode: "auto",
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load recipe data if editing
  useEffect(() => {
    if (recipe) {
      const formDataFromRecipe = recipeToFormData(recipe);
      setFormData(formDataFromRecipe);
    }
  }, [recipe]);

  // Load available categories
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        // Fetch categories from trivia questions
        // We'll get unique categories from all trivia tables
        const [mcResponse, tfResponse, waiResponse] = await Promise.all([
          fetch("/api/multiple-choice-trivia?limit=1000&status=published"),
          fetch("/api/true-false-trivia?limit=1000&status=published"),
          fetch("/api/who-am-i-trivia?limit=1000&status=published"),
        ]);

        const categoriesSet = new Set<string>();

        if (mcResponse.ok) {
          const mcData = await mcResponse.json();
          if (mcData.success && mcData.data) {
            mcData.data.forEach((q: any) => {
              if (q.category) categoriesSet.add(q.category);
            });
          }
        }

        if (tfResponse.ok) {
          const tfData = await tfResponse.json();
          if (tfData.success && tfData.data) {
            tfData.data.forEach((q: any) => {
              if (q.category) categoriesSet.add(q.category);
            });
          }
        }

        if (waiResponse.ok) {
          const waiData = await waiResponse.json();
          if (waiData.success && waiData.data) {
            waiData.data.forEach((q: any) => {
              if (q.category) categoriesSet.add(q.category);
            });
          }
        }

        setAvailableCategories(Array.from(categoriesSet).sort());
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (
    field: keyof RecipeFormData,
    value: string | number | boolean | string[] | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleQuestionTypeToggle = (type: string) => {
    setFormData((prev) => {
      const currentTypes = prev.questionTypes;
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];
      return {
        ...prev,
        questionTypes: newTypes,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate form
    const validation = validateRecipeForm(formData);
    if (!validation.valid) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.forEach((error) => {
        // Map validation errors to fields
        if (error.includes("name")) fieldErrors.name = error;
        if (error.includes("category")) fieldErrors.category = error;
        if (error.includes("questionTypes")) fieldErrors.questionTypes = error;
        if (error.includes("quantity")) fieldErrors.quantityMin = error;
        if (error.includes("cooldown")) fieldErrors.cooldownDays = error;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const recipeInput = parseRecipeForm(formData);
      await onSubmit(recipeInput);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save recipe",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && <Alert type="error" message={submitError} />}

      <Heading level={2}>{recipe ? "Edit Recipe" : "Create Recipe"}</Heading>

      {/* Step 1: Discovery - Category & Theme */}
      <div className="space-y-4">
        <Heading level={3}>1. Discover & Select</Heading>
        <p className="text-sm text-gray-600 mb-4">
          Start by exploring what content is available. Select a category to see
          what questions you can work with.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          {isLoadingCategories ? (
            <div className="text-sm text-gray-500">Loading categories...</div>
          ) : (
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Select a category</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Theme (Reference Only)
          </label>
          <select
            value={formData.theme || ""}
            onChange={(e) => handleChange("theme", e.target.value || undefined)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select a theme (optional)</option>
            {THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Theme is for reference only and does not filter questions
          </p>
        </div>
      </div>

      {/* Step 2: Question Types */}
      <div className="space-y-4">
        <Heading level={3}>2. Choose Question Types</Heading>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Question Types <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {QUESTION_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.questionTypes.includes(option.value)}
                  onChange={() => handleQuestionTypeToggle(option.value)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.questionTypes && (
            <p className="mt-1 text-sm text-red-600">{errors.questionTypes}</p>
          )}
          {formData.questionTypes.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Select at least one question type
            </p>
          )}
        </div>
      </div>

      {/* Step 3: Configuration - Quantity */}
      <div className="space-y-4">
        <Heading level={3}>3. Configure Quantity</Heading>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Minimum"
            type="number"
            min={1}
            max={20}
            value={formData.quantityMin}
            onChange={(e) =>
              handleChange("quantityMin", parseInt(e.target.value) || 1)
            }
            required
            error={errors.quantityMin}
          />
          <Input
            label="Maximum"
            type="number"
            min={1}
            max={20}
            value={formData.quantityMax}
            onChange={(e) =>
              handleChange("quantityMax", parseInt(e.target.value) || 20)
            }
            required
            error={errors.quantityMax}
          />
          <Input
            label="Default"
            type="number"
            min={formData.quantityMin}
            max={formData.quantityMax}
            value={formData.quantityDefault}
            onChange={(e) =>
              handleChange(
                "quantityDefault",
                parseInt(e.target.value) || formData.quantityMin,
              )
            }
            required
            error={errors.quantityDefault}
          />
        </div>
        <p className="text-xs text-gray-500">
          Default quantity will be used unless overridden when executing the
          recipe
        </p>
      </div>

      {/* Step 4: Configuration - Cooldown */}
      <div className="space-y-4">
        <Heading level={3}>4. Configure Cooldown</Heading>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.cooldownEnabled}
              onChange={(e) =>
                handleChange("cooldownEnabled", e.target.checked)
              }
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Enable cooldown</span>
          </label>
        </div>
        {formData.cooldownEnabled && (
          <Input
            label="Cooldown Days"
            type="number"
            min={0}
            value={formData.cooldownDays || ""}
            onChange={(e) =>
              handleChange(
                "cooldownDays",
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            placeholder="e.g., 7"
            error={errors.cooldownDays}
          />
        )}
        <p className="text-xs text-gray-500">
          Exclude questions used in sets created within the specified number of
          days
        </p>
      </div>

      {/* Step 5: Configuration - Execution Mode */}
      <div className="space-y-4">
        <Heading level={3}>5. Choose Execution Mode</Heading>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="executionMode"
              value="auto"
              checked={formData.executionMode === "auto"}
              onChange={(e) => handleChange("executionMode", e.target.value)}
              className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Automated
              </span>
              <p className="text-xs text-gray-500">
                System automatically builds the set using the recipe
              </p>
            </div>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="executionMode"
              value="manual"
              checked={formData.executionMode === "manual"}
              onChange={(e) => handleChange("executionMode", e.target.value)}
              className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Manual</span>
              <p className="text-xs text-gray-500">
                User reviews and manually selects questions
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Step 6: Name & Describe */}
      <div className="space-y-4 pt-4 border-t">
        <Heading level={3}>6. Name & Describe</Heading>
        <p className="text-sm text-gray-600 mb-4">
          Now that you&apos;ve configured your recipe, give it a name and
          description to remember what it does.
        </p>

        <Input
          label="Recipe Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="e.g., Game Day Quick Set"
          required
          error={errors.name}
        />

        <Textarea
          label="Description (Optional)"
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Brief description of what this recipe does"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : recipe
              ? "Update Recipe"
              : "Create Recipe"}
        </Button>
      </div>
    </form>
  );
}
