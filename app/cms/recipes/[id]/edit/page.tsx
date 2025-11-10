"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import RecipeForm from "@/components/recipes/recipe-form";
import { loadRecipe } from "@/lib/recipes/executor";
import type { Recipe, RecipeCreateInput } from "@/lib/recipes/types";

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.id ? parseInt(params.id as string) : null;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) {
      setError("Invalid recipe ID");
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      const loadedRecipe = await loadRecipe(recipeId);
      if (loadedRecipe) {
        setRecipe(loadedRecipe);
      } else {
        setError("Recipe not found");
      }
      setIsLoading(false);
    };

    load();
  }, [recipeId]);

  const handleSubmit = async (recipeInput: RecipeCreateInput) => {
    if (!recipeId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeInput),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update recipe");
      }

      // Redirect to recipes page
      router.push("/cms/recipes");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update recipe",
      );
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/cms/recipes");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert type="error" message={error || "Recipe not found"} />
          <div className="mt-4">
            <button
              onClick={() => router.push("/cms/recipes")}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              ← Back to Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Heading level={1}>Edit Recipe</Heading>
          <p className="text-sm text-gray-600 mt-2">
            Update recipe: {recipe.name}
          </p>
        </div>

        {submitError && <Alert type="error" message={submitError} />}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <RecipeForm
            recipe={recipe}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
