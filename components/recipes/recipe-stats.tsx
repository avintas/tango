"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/ui/heading";
import type { RecipeStats } from "@/lib/recipes/types";

interface RecipeStatsProps {
  category: string;
  onCategorySelect?: (category: string) => void;
}

export default function RecipeStatsComponent({
  category,
  onCategorySelect,
}: RecipeStatsProps) {
  const [stats, setStats] = useState<RecipeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!category) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/recipes/stats?category=${encodeURIComponent(category)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setStats(result.data);
        } else {
          setError("No stats available for this category");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load statistics",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [category]);

  if (!category) {
    return (
      <div className="text-center py-8 text-gray-500">
        Select a category to view statistics
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-600">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading level={3}>{stats.category}</Heading>
        {stats.theme && (
          <p className="text-sm text-gray-600 mt-1">Theme: {stats.theme}</p>
        )}
      </div>

      {/* Question Counts by Type */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Available Questions
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">
              {stats.questionCounts["multiple-choice"]}
            </div>
            <div className="text-xs text-blue-700 mt-1">Multiple Choice</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">
              {stats.questionCounts["true-false"]}
            </div>
            <div className="text-xs text-green-700 mt-1">True/False</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">
              {stats.questionCounts["who-am-i"]}
            </div>
            <div className="text-xs text-purple-700 mt-1">Who Am I</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="inline-block bg-indigo-50 border border-indigo-200 rounded-lg px-6 py-3">
            <div className="text-3xl font-bold text-indigo-900">
              {stats.totalAvailable}
            </div>
            <div className="text-sm text-indigo-700 mt-1">Total Available</div>
          </div>
        </div>
      </div>

      {/* Difficulty Distribution */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Difficulty Distribution
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">
              {stats.byDifficulty.Easy}
            </div>
            <div className="text-xs text-green-700 mt-1">Easy</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-900">
              {stats.byDifficulty.Medium}
            </div>
            <div className="text-xs text-yellow-700 mt-1">Medium</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-900">
              {stats.byDifficulty.Hard}
            </div>
            <div className="text-xs text-red-700 mt-1">Hard</div>
          </div>
        </div>
      </div>

      {/* Recent Usage */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Recent Usage
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-gray-900">
              {stats.recentUsage.last7Days}
            </div>
            <div className="text-xs text-gray-700 mt-1">Sets (Last 7 Days)</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-gray-900">
              {stats.recentUsage.last30Days}
            </div>
            <div className="text-xs text-gray-700 mt-1">
              Sets (Last 30 Days)
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {onCategorySelect && (
        <div className="pt-4 border-t">
          <button
            onClick={() => onCategorySelect(stats.category)}
            className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500 transition-colors"
          >
            Create Recipe for {stats.category}
          </button>
        </div>
      )}
    </div>
  );
}
