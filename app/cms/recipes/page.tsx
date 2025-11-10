"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import RecipeSelector from "@/components/recipes/recipe-selector";
import { listRecipes, loadRecipe, executeRecipe } from "@/lib/recipes/executor";
import type { Recipe } from "@/lib/recipes/types";
import { Alert } from "@/components/ui/alert";

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [allowPartialSets, setAllowPartialSets] = useState(false);
  const [executeResult, setExecuteResult] = useState<{
    success: boolean;
    message: string;
    triviaSetId?: number;
    warnings?: string[];
  } | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const result = await listRecipes({ limit: 100 });
      setRecipes(result.recipes);
    } catch (error) {
      console.error("Error loading recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setExecuteResult(null);
  };

  const handleExecuteRecipe = async () => {
    if (!selectedRecipe) return;

    setIsExecuting(true);
    setExecuteResult(null);

    try {
      const result = await executeRecipe(selectedRecipe.id, {
        allowPartialSets,
      });

      if (result.success) {
        const message =
          result.warnings && result.warnings.length > 0
            ? `Created trivia set with ${result.questionsSelected} questions. ${result.warnings.join(" ")}`
            : `Successfully created trivia set with ${result.questionsSelected} questions!`;

        setExecuteResult({
          success: true,
          message,
          triviaSetId: result.triviaSetId,
          warnings: result.warnings,
        });
        // Reload recipes to update usage stats
        await loadRecipes();
      } else {
        setExecuteResult({
          success: false,
          message: result.error || "Failed to execute recipe",
        });
      }
    } catch (error) {
      setExecuteResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to execute recipe",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    router.push(`/cms/recipes/${recipe.id}/edit`);
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (
      !confirm(
        `Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadRecipes();
        if (selectedRecipe?.id === recipe.id) {
          setSelectedRecipe(null);
        }
      } else {
        alert("Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level={1}>Recipes</Heading>
            <p className="text-sm text-gray-600 mt-2">
              Manage reusable recipe templates for building trivia sets
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/cms/recipes/create")}
          >
            Create New Recipe
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recipe List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <RecipeSelector
                onSelectRecipe={handleSelectRecipe}
                selectedRecipeId={selectedRecipe?.id}
              />
            </div>
          </div>

          {/* Right Column: Selected Recipe Actions */}
          <div className="space-y-6">
            {selectedRecipe ? (
              <>
                {/* Recipe Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <Heading level={3}>Selected Recipe</Heading>
                  <div className="mt-4 space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>{" "}
                      <span className="text-gray-900">
                        {selectedRecipe.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Category:
                      </span>{" "}
                      <span className="text-gray-900">
                        {selectedRecipe.category}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Types:</span>{" "}
                      <span className="text-gray-900">
                        {selectedRecipe.questionTypes.join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Quantity:
                      </span>{" "}
                      <span className="text-gray-900">
                        {selectedRecipe.quantity.min}-
                        {selectedRecipe.quantity.max} (default:{" "}
                        {selectedRecipe.quantity.default})
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Mode:</span>{" "}
                      <span className="text-gray-900">
                        {selectedRecipe.executionMode === "auto"
                          ? "Automated"
                          : "Manual"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Used:</span>{" "}
                      <span className="text-gray-900">
                        {selectedRecipe.usageCount} time
                        {selectedRecipe.usageCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowPartialSets}
                      onChange={(e) => setAllowPartialSets(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      Allow partial sets (use available questions if fewer than
                      requested)
                    </span>
                  </label>

                  <Button
                    variant="primary"
                    onClick={handleExecuteRecipe}
                    disabled={isExecuting}
                    className="w-full"
                  >
                    {isExecuting ? "Executing..." : "Execute Recipe"}
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleEditRecipe(selectedRecipe)}
                      className="w-full"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteRecipe(selectedRecipe)}
                      className="w-full"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Execution Result */}
                {executeResult && (
                  <div className="space-y-2">
                    <Alert
                      type={executeResult.success ? "success" : "error"}
                      message={executeResult.message}
                    />
                    {executeResult.success &&
                      executeResult.warnings &&
                      executeResult.warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong>{" "}
                            {executeResult.warnings.join(" ")}
                          </p>
                        </div>
                      )}
                  </div>
                )}

                {executeResult?.success && executeResult.triviaSetId && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-2">
                    <p className="text-sm text-gray-600 mb-2">
                      Trivia set created successfully! View it in the library.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() =>
                        router.push(
                          `/cms/trivia-sets-multiple-choice-library?status=published`,
                        )
                      }
                      className="w-full"
                    >
                      View Published Sets
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/cms/trivia-sets-multiple-choice-library`)
                      }
                      className="w-full"
                    >
                      View All Sets
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                Select a recipe to view details and execute
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
