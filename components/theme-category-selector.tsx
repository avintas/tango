/**
 * Theme and Category Selector for Trivia Set Builder
 * Provides visual theme selection and category suggestions based on selected theme
 */

"use client";

import { useState, useEffect } from "react";
import ThemeSelector, { type Theme } from "@/components/theme-selector";
import type { SourceContentCategory } from "@/lib/supabase";

interface ThemeCategorySelectorProps {
  selectedTheme: Theme | null;
  selectedCategory: SourceContentCategory | null;
  onThemeSelect: (theme: Theme) => void;
  onCategorySelect: (category: SourceContentCategory | null) => void;
}

// Categories grouped by theme
const categoriesByTheme: Record<Theme, SourceContentCategory[]> = {
  Players: [
    "Player Spotlight",
    "Sharpshooters",
    "Net Minders",
    "Icons",
    "Captains",
    "Hockey is Family",
  ],
  "Teams & Organizations": [
    "Stanley Cup Playoffs",
    "NHL Draft",
    "Free Agency",
    "Game Day",
    "Hockey Nations",
    "All-Star Game",
    "Heritage Classic",
  ],
  "Venues & Locations": ["Stadium Series", "Global Series"],
  "Awards & Honors": ["NHL Awards", "Milestones"],
  "Leadership & Staff": ["Coaching", "Management", "Front Office"],
};

export default function ThemeCategorySelector({
  selectedTheme,
  selectedCategory,
  onThemeSelect,
  onCategorySelect,
}: ThemeCategorySelectorProps) {
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available themes and categories from existing questions
  useEffect(() => {
    const fetchAvailableData = async () => {
      try {
        // Fetch themes and categories from all trivia tables
        const response = await fetch("/api/trivia-questions/themes-categories");
        const result = await response.json();

        if (result.success && result.data) {
          setAvailableThemes(result.data.themes || []);
          setAvailableCategories(result.data.categories || []);

          // Fetch category counts
          const counts: Record<string, number> = {};
          for (const category of result.data.categories || []) {
            try {
              const countResponse = await fetch(
                `/api/multiple-choice-trivia?status=published&category=${encodeURIComponent(category)}&limit=1`,
              );
              const countResult = await countResponse.json();
              if (countResult.success) {
                counts[category] = countResult.count || 0;
              }
            } catch (err) {
              // Ignore errors for individual category counts
            }
          }
          setCategoryCounts(counts);
        }
      } catch (error) {
        console.error("Failed to fetch available themes/categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableData();
  }, []);

  // Fetch category counts when theme is selected
  useEffect(() => {
    if (!selectedTheme) return;

    const fetchCategoryCounts = async () => {
      const counts: Record<string, number> = {};
      const categoriesToCheck = categoriesByTheme[selectedTheme];

      // Fetch counts for all categories for this theme
      await Promise.all(
        categoriesToCheck.map(async (category) => {
          try {
            const countResponse = await fetch(
              `/api/multiple-choice-trivia?status=published&category=${encodeURIComponent(category)}&limit=1`,
            );
            const countResult = await countResponse.json();
            if (countResult.success) {
              counts[category] = countResult.count || 0;
            } else {
              counts[category] = 0;
            }
          } catch (err) {
            // Ignore errors for individual category counts
            counts[category] = 0;
          }
        }),
      );

      setCategoryCounts((prev) => ({ ...prev, ...counts }));
    };

    fetchCategoryCounts();
  }, [selectedTheme]);

  // Always show all categories for the selected theme (they're standardized)
  const availableCategoriesForTheme = selectedTheme
    ? categoriesByTheme[selectedTheme]
    : [];

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Theme *
        </label>
        <ThemeSelector
          selectedTheme={selectedTheme}
          onThemeSelect={onThemeSelect}
        />
        {availableThemes.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            Available themes in your questions: {availableThemes.join(", ")}
          </p>
        )}
      </div>

      {/* Category Selection (only shown when theme is selected) */}
      {selectedTheme && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Category (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Refine your theme selection with a specific category
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onCategorySelect(null)}
              className={`
                px-3 py-2 text-sm rounded-md border transition-all
                ${
                  selectedCategory === null
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-medium"
                    : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                }
              `}
            >
              Any Category
            </button>
            {availableCategoriesForTheme.map((category) => {
              const isSelected = selectedCategory === category;
              const questionCount = categoryCounts[category] || 0;
              const hasQuestions = questionCount > 0;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategorySelect(category)}
                  className={`
                    px-3 py-2 text-sm rounded-md border transition-all text-left
                    ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-medium"
                        : hasQuestions
                          ? "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                  title={
                    hasQuestions
                      ? `${questionCount} question${questionCount !== 1 ? "s" : ""} available`
                      : "No questions available yet - you can still select this category"
                  }
                >
                  <div className="flex items-center justify-between">
                    <span>{category}</span>
                    {hasQuestions ? (
                      <span
                        className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-indigo-200 text-indigo-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {questionCount}
                      </span>
                    ) : (
                      <span className="ml-2 text-xs text-gray-400">(0)</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {availableCategoriesForTheme.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">
              No categories available for this theme. Questions will be selected
              from any category.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
