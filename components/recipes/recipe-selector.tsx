"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading } from "@/components/ui/heading";
import { listRecipes, type Recipe } from "@/lib/recipes/executor";
import clsx from "clsx";

interface RecipeSelectorProps {
  onSelectRecipe: (recipe: Recipe) => void;
  selectedRecipeId?: number;
  filters?: {
    category?: string;
    executionMode?: "auto" | "manual";
  };
}

export default function RecipeSelector({
  onSelectRecipe,
  selectedRecipeId,
  filters,
}: RecipeSelectorProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState(filters?.category || "");
  const [filterMode, setFilterMode] = useState(filters?.executionMode || "");

  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoading(true);
      try {
        const result = await listRecipes({
          category: filterCategory || undefined,
          executionMode: filterMode || undefined,
          limit: 100,
        });
        setRecipes(result.recipes);
      } catch (error) {
        console.error("Error loading recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, [filterCategory, filterMode]);

  const filteredRecipes = recipes.filter((recipe) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        recipe.name.toLowerCase().includes(searchLower) ||
        recipe.category.toLowerCase().includes(searchLower) ||
        recipe.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getBagTypeLabel = (bagType: string) => {
    switch (bagType) {
      case "category-bound-mc":
        return "MC Only";
      case "category-bound-tf":
        return "TF Only";
      case "category-bound-mix":
        return "Mixed";
      default:
        return bagType;
    }
  };

  const getQuestionTypesLabel = (types: string[]) => {
    const labels: Record<string, string> = {
      "multiple-choice": "MC",
      "true-false": "TF",
      "who-am-i": "WAI",
    };
    return types.map((t) => labels[t] || t).join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <Input
          label="Search Recipes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, category..."
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {Array.from(new Set(recipes.map((r) => r.category)))
                .sort()
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Mode
            </label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Modes</option>
              <option value="auto">Automated</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm || filterCategory || filterMode
            ? "No recipes match your filters"
            : "No recipes found. Create your first recipe!"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className={clsx(
                "p-4 rounded-lg border cursor-pointer transition-colors",
                selectedRecipeId === recipe.id
                  ? "bg-indigo-50 border-indigo-300"
                  : "bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50",
              )}
              onClick={() => onSelectRecipe(recipe)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {recipe.name}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      {getBagTypeLabel(recipe.bagType)}
                    </span>
                    <span
                      className={clsx(
                        "px-2 py-0.5 text-xs font-medium rounded",
                        recipe.executionMode === "auto"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800",
                      )}
                    >
                      {recipe.executionMode === "auto" ? "Auto" : "Manual"}
                    </span>
                  </div>

                  {recipe.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {recipe.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      <span className="font-medium">Category:</span>{" "}
                      {recipe.category}
                    </span>
                    {recipe.theme && (
                      <>
                        <span>•</span>
                        <span>
                          <span className="font-medium">Theme:</span>{" "}
                          {recipe.theme}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>
                      <span className="font-medium">Types:</span>{" "}
                      {getQuestionTypesLabel(recipe.questionTypes)}
                    </span>
                    <span>•</span>
                    <span>
                      <span className="font-medium">Quantity:</span>{" "}
                      {recipe.quantity.min}-{recipe.quantity.max} (default:{" "}
                      {recipe.quantity.default})
                    </span>
                    {recipe.cooldown.enabled && (
                      <>
                        <span>•</span>
                        <span>
                          <span className="font-medium">Cooldown:</span>{" "}
                          {recipe.cooldown.days} days
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    Used {recipe.usageCount} time
                    {recipe.usageCount !== 1 ? "s" : ""}
                    {recipe.lastUsedAt &&
                      ` • Last used: ${new Date(recipe.lastUsedAt).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
