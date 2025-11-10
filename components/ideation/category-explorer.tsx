"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import RecipeStatsComponent from "@/components/recipes/recipe-stats";
import clsx from "clsx";

interface CategoryExplorerProps {
  onCategorySelect?: (category: string) => void;
}

export default function CategoryExplorer({
  onCategorySelect,
}: CategoryExplorerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryStats, setCategoryStats] = useState<
    Record<string, { total: number; mc: number; tf: number; wai: number }>
  >({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      // Fetch categories from all trivia tables
      const [mcResponse, tfResponse, waiResponse] = await Promise.all([
        fetch("/api/multiple-choice-trivia?limit=1000&status=published"),
        fetch("/api/true-false-trivia?limit=1000&status=published"),
        fetch("/api/who-am-i-trivia?limit=1000&status=published"),
      ]);

      const categoriesSet = new Set<string>();
      const stats: Record<
        string,
        { total: number; mc: number; tf: number; wai: number }
      > = {};

      // Process Multiple Choice
      if (mcResponse.ok) {
        const mcData = await mcResponse.json();
        if (mcData.success && mcData.data) {
          mcData.data.forEach((q: any) => {
            if (q.category) {
              categoriesSet.add(q.category);
              if (!stats[q.category]) {
                stats[q.category] = { total: 0, mc: 0, tf: 0, wai: 0 };
              }
              stats[q.category].mc++;
              stats[q.category].total++;
            }
          });
        }
      }

      // Process True/False
      if (tfResponse.ok) {
        const tfData = await tfResponse.json();
        if (tfData.success && tfData.data) {
          tfData.data.forEach((q: any) => {
            if (q.category) {
              categoriesSet.add(q.category);
              if (!stats[q.category]) {
                stats[q.category] = { total: 0, mc: 0, tf: 0, wai: 0 };
              }
              stats[q.category].tf++;
              stats[q.category].total++;
            }
          });
        }
      }

      // Process Who Am I
      if (waiResponse.ok) {
        const waiData = await waiResponse.json();
        if (waiData.success && waiData.data) {
          waiData.data.forEach((q: any) => {
            if (q.category) {
              categoriesSet.add(q.category);
              if (!stats[q.category]) {
                stats[q.category] = { total: 0, mc: 0, tf: 0, wai: 0 };
              }
              stats[q.category].wai++;
              stats[q.category].total++;
            }
          });
        }
      }

      setCategories(Array.from(categoriesSet).sort());
      setCategoryStats(stats);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleCreateRecipe = (category: string) => {
    router.push(`/cms/recipes/create?category=${encodeURIComponent(category)}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Category Explorer
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Explore available content by category. Click a category to see
          statistics and create recipes.
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const stats = categoryStats[category] || {
            total: 0,
            mc: 0,
            tf: 0,
            wai: 0,
          };

          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={clsx(
                "p-4 rounded-lg border text-left transition-colors",
                selectedCategory === category
                  ? "bg-indigo-50 border-indigo-300"
                  : "bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50",
              )}
            >
              <div className="font-medium text-gray-900 mb-1">{category}</div>
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {stats.total}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>MC: {stats.mc}</div>
                <div>TF: {stats.tf}</div>
                <div>WAI: {stats.wai}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Category Stats */}
      {selectedCategory && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              {selectedCategory} Statistics
            </h3>
            <Button
              variant="primary"
              onClick={() => handleCreateRecipe(selectedCategory)}
            >
              Create Recipe
            </Button>
          </div>
          <RecipeStatsComponent
            category={selectedCategory}
            onCategorySelect={handleCreateRecipe}
          />
        </div>
      )}

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No categories found. Make sure you have published trivia questions
          with categories assigned.
        </div>
      )}
    </div>
  );
}
