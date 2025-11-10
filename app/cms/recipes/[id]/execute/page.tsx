"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import {
  loadRecipe,
  executeRecipe,
  previewRecipe,
} from "@/lib/recipes/executor";
import type { Recipe } from "@/lib/recipes/types";

export default function ExecuteRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.id ? parseInt(params.id as string) : null;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantityOverride, setQuantityOverride] = useState<number | null>(null);
  const [preview, setPreview] = useState<{
    available: number;
    wouldSelect: number;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeResult, setExecuteResult] = useState<{
    success: boolean;
    message: string;
    triviaSetId?: number;
  } | null>(null);

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
        // Load preview
        const previewResult = await previewRecipe(loadedRecipe);
        if (previewResult.success && previewResult.available !== undefined) {
          setPreview({
            available: previewResult.available,
            wouldSelect:
              previewResult.wouldSelect || loadedRecipe.quantity.default,
          });
        }
      } else {
        setError("Recipe not found");
      }
      setIsLoading(false);
    };

    load();
  }, [recipeId]);

  const handleExecute = async () => {
    if (!recipe) return;

    setIsExecuting(true);
    setExecuteResult(null);

    try {
      const result = await executeRecipe(recipe.id, {
        quantity: quantityOverride || undefined,
      });

      if (result.success) {
        setExecuteResult({
          success: true,
          message: `Successfully created trivia set with ${result.questionsSelected} questions!`,
          triviaSetId: result.triviaSetId,
        });
      } else {
        setExecuteResult({
          success: false,
          message: result.error || "Failed to execute recipe",
        });
      }
    } catch (err) {
      setExecuteResult({
        success: false,
        message:
          err instanceof Error ? err.message : "Failed to execute recipe",
      });
    } finally {
      setIsExecuting(false);
    }
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

  const targetQuantity = quantityOverride || recipe.quantity.default;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Heading level={1}>Execute Recipe</Heading>
          <p className="text-sm text-gray-600 mt-2">{recipe.name}</p>
        </div>

        {/* Recipe Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Heading level={3}>Recipe Details</Heading>
          <div className="mt-4 space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Category:</span>{" "}
              <span className="text-gray-900">{recipe.category}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Question Types:</span>{" "}
              <span className="text-gray-900">
                {recipe.questionTypes.join(", ")}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Quantity Range:</span>{" "}
              <span className="text-gray-900">
                {recipe.quantity.min}-{recipe.quantity.max} (default:{" "}
                {recipe.quantity.default})
              </span>
            </div>
            {recipe.cooldown.enabled && (
              <div>
                <span className="font-medium text-gray-700">Cooldown:</span>{" "}
                <span className="text-gray-900">
                  {recipe.cooldown.days} days
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Mode:</span>{" "}
              <span className="text-gray-900">
                {recipe.executionMode === "auto" ? "Automated" : "Manual"}
              </span>
            </div>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <Heading level={3}>Preview</Heading>
            <div className="mt-4 space-y-2 text-sm">
              <div>
                <span className="font-medium text-blue-900">
                  Available Questions:
                </span>{" "}
                <span className="text-blue-700">{preview.available}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Will Select:</span>{" "}
                <span className="text-blue-700">
                  {Math.min(targetQuantity, preview.available)} questions
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quantity Override */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Heading level={3}>Execution Options</Heading>
          <div className="mt-4">
            <Input
              label="Quantity Override (Optional)"
              type="number"
              min={recipe.quantity.min}
              max={recipe.quantity.max}
              value={quantityOverride || ""}
              onChange={(e) =>
                setQuantityOverride(
                  e.target.value ? parseInt(e.target.value) : null,
                )
              }
              placeholder={`Default: ${recipe.quantity.default}`}
            />
            <p className="mt-2 text-xs text-gray-500">
              Leave empty to use default quantity ({recipe.quantity.default})
            </p>
          </div>
        </div>

        {/* Execute Button */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Button
            variant="primary"
            onClick={handleExecute}
            disabled={isExecuting}
            className="w-full"
          >
            {isExecuting ? "Executing..." : "Execute Recipe"}
          </Button>
        </div>

        {/* Execution Result */}
        {executeResult && (
          <Alert
            type={executeResult.success ? "success" : "error"}
            message={executeResult.message}
          />
        )}

        {executeResult?.success && executeResult.triviaSetId && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Trivia set created successfully! You can view it in the trivia
                sets library.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/cms/recipes")}
                  className="flex-1"
                >
                  Back to Recipes
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    router.push("/cms/trivia-sets-multiple-choice-library")
                  }
                  className="flex-1"
                >
                  View Trivia Sets
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
