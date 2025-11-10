"use client";

import { useState, useEffect } from "react";
import { buildTriviaSetAction } from "@/process-builders/build-trivia-set/lib/actions";
import type {
  ProcessBuilderGoal,
  ProcessBuilderRules,
} from "@/process-builders/core/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import type { ProcessBuilderResult } from "@/process-builders/core/types";
import type { Theme } from "@/components/theme-selector";
import type { SourceContentCategory } from "@/lib/supabase";
import RecipeSelector from "@/components/recipes/recipe-selector";
import { executeRecipe, loadRecipe } from "@/lib/recipes/executor";
import type { Recipe } from "@/lib/recipes/types";

// Helper to format metadata keys
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Helper to format metadata values
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
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

export default function BuildTriviaSetPage() {
  const [mode, setMode] = useState<"manual" | "recipe">("manual");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<SourceContentCategory | null>(null);
  const [goal, setGoal] = useState("");
  const [questionTypes, setQuestionTypes] = useState<string[]>(["TMC", "TFT"]);
  const [questionCount, setQuestionCount] = useState(3);
  const [distributionStrategy, setDistributionStrategy] = useState<
    "even" | "weighted" | "custom"
  >("weighted");
  const [cooldownDays, setCooldownDays] = useState(30);
  const [allowPartialSets, setAllowPartialSets] = useState(false);

  const [availableThemes, setAvailableThemes] = useState<string[]>([]);
  const [themeQuestionCounts, setThemeQuestionCounts] = useState<
    Record<string, number>
  >({});
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessBuilderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load available themes and question counts
  useEffect(() => {
    const loadThemes = async () => {
      setIsLoadingThemes(true);
      try {
        const response = await fetch("/api/trivia-questions/themes-categories");
        const result = await response.json();

        if (result.success && result.data) {
          setAvailableThemes(result.data.themes || []);

          // Fetch question counts by theme
          const counts: Record<string, number> = {};
          for (const theme of result.data.themes || []) {
            try {
              const countResponse = await fetch(
                `/api/multiple-choice-trivia?status=published&theme=${encodeURIComponent(theme)}&limit=1`,
              );
              const countResult = await countResponse.json();
              if (countResult.success) {
                counts[theme] = countResult.count || 0;
              }
            } catch (err) {
              counts[theme] = 0;
            }
          }
          setThemeQuestionCounts(counts);
        }
      } catch (error) {
        console.error("Failed to load themes:", error);
      } finally {
        setIsLoadingThemes(false);
      }
    };

    loadThemes();
  }, []);

  // Load category counts when theme is selected
  useEffect(() => {
    if (!selectedTheme) {
      setCategoryCounts({});
      return;
    }

    const fetchCategoryCounts = async () => {
      const counts: Record<string, number> = {};
      const categoriesToCheck = categoriesByTheme[selectedTheme];

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
            counts[category] = 0;
          }
        }),
      );

      setCategoryCounts(counts);
    };

    fetchCategoryCounts();
  }, [selectedTheme]);

  // Update goal when theme/category changes
  useEffect(() => {
    if (selectedTheme) {
      if (selectedCategory) {
        setGoal(`${selectedTheme} - ${selectedCategory}`);
      } else {
        setGoal(selectedTheme);
      }
    }
  }, [selectedTheme, selectedCategory]);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setSelectedCategory(null); // Reset category when theme changes
  };

  const handleCategorySelect = (category: SourceContentCategory | null) => {
    setSelectedCategory(category);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleExecuteRecipe = async () => {
    if (!selectedRecipe) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const executeResult = await executeRecipe(selectedRecipe.id);

      if (executeResult.success) {
        setResult({
          success: true,
          data: {
            triviaSetId: executeResult.triviaSetId,
            questionsSelected: executeResult.questionsSelected,
          },
          metadata: {
            recipeId: selectedRecipe.id,
            recipeName: selectedRecipe.name,
          },
        });
      } else {
        setError(executeResult.error || "Failed to execute recipe");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const processGoal: ProcessBuilderGoal = {
        text: goal.trim(),
      };

      const rules: ProcessBuilderRules = {
        questionTypes: {
          key: "questionTypes",
          value: questionTypes,
          type: "array",
        },
        questionCount: {
          key: "questionCount",
          value: questionCount,
          type: "number",
        },
        distributionStrategy: {
          key: "distributionStrategy",
          value: distributionStrategy,
          type: "string",
        },
        cooldownDays: {
          key: "cooldownDays",
          value: cooldownDays,
          type: "number",
        },
        allowPartialSets: {
          key: "allowPartialSets",
          value: allowPartialSets,
          type: "boolean",
        },
      };

      const processResult = await buildTriviaSetAction(processGoal, rules, {
        allowPartialResults: allowPartialSets,
      });

      setResult(processResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionType = (type: string) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const availableCategoriesForTheme = selectedTheme
    ? categoriesByTheme[selectedTheme]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Heading level={1}>Build Trivia Set</Heading>
        <p className="text-sm text-gray-600">
          Select a theme, configure your set, and build curated trivia from
          existing questions.
        </p>

        {/* Mode Toggle */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Mode:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === "manual"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                onClick={() => setMode("recipe")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === "recipe"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Recipe
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Theme & Category Exploration */}
          <div className="lg:col-span-2 space-y-6">
            {mode === "recipe" ? (
              /* Recipe Mode */
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Select Recipe
                </h3>
                <RecipeSelector
                  onSelectRecipe={handleRecipeSelect}
                  selectedRecipeId={selectedRecipe?.id}
                />
              </div>
            ) : (
              /* Manual Mode */
              <>
                {/* Theme Explorer */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Select Theme *
                  </h3>
                  {isLoadingThemes ? (
                    <div className="p-4 text-sm text-gray-500">
                      Loading themes...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          "Players",
                          "Teams & Organizations",
                          "Venues & Locations",
                          "Awards & Honors",
                          "Leadership & Staff",
                        ] as Theme[]
                      ).map((theme) => {
                        const isSelected = selectedTheme === theme;
                        const questionCount = themeQuestionCounts[theme] || 0;

                        return (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => handleThemeSelect(theme)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {theme}
                            {questionCount > 0 && (
                              <span
                                className={`ml-1.5 ${isSelected ? "text-indigo-200" : "text-gray-500"}`}
                              >
                                ({questionCount})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Category Selection */}
                {selectedTheme && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Select Category (Optional)
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Refine your theme selection with a specific category
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(null)}
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
                            onClick={() => handleCategorySelect(category)}
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
                                : "No questions available yet"
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
                                <span className="ml-2 text-xs text-gray-400">
                                  (0)
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: Configuration & Build */}
          <div className="space-y-6">
            {mode === "manual" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Goal Input */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <label
                    htmlFor="goal"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Set Goal/Description *
                  </label>
                  <Input
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Player Spotlight - Max Pacioretty"
                    required
                    disabled={loading}
                    className="text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Auto-populated from theme/category, but customizable
                  </p>
                </div>

                {/* Question Types */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Question Types *
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "TMC", label: "Multiple Choice" },
                      { value: "TFT", label: "True/False" },
                      { value: "WAI", label: "Who Am I" },
                    ].map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={questionTypes.includes(type.value)}
                          onChange={() => toggleQuestionType(type.value)}
                          disabled={loading}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {questionTypes.length === 0 && (
                    <p className="mt-2 text-xs text-red-600">
                      At least one question type is required
                    </p>
                  )}
                </div>

                {/* Question Count */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <label
                    htmlFor="questionCount"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Number of Questions *
                  </label>
                  <Input
                    id="questionCount"
                    type="number"
                    min="1"
                    max="100"
                    value={questionCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setQuestionCount(isNaN(value) ? 3 : Math.max(1, value));
                    }}
                    required
                    disabled={loading}
                    className="text-sm"
                  />
                </div>

                {/* Distribution Strategy */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <label
                    htmlFor="distributionStrategy"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Distribution Strategy
                  </label>
                  <select
                    id="distributionStrategy"
                    value={distributionStrategy}
                    onChange={(e) =>
                      setDistributionStrategy(
                        e.target.value as "even" | "weighted" | "custom",
                      )
                    }
                    disabled={loading}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="even">Even Split</option>
                    <option value="weighted">Weighted by Availability</option>
                    <option value="custom">Custom</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    How to distribute questions across types
                  </p>
                </div>

                {/* Advanced Options */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Advanced Options
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="cooldownDays"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Cooldown Days
                      </label>
                      <Input
                        id="cooldownDays"
                        type="number"
                        min="0"
                        max="365"
                        value={cooldownDays}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setCooldownDays(isNaN(value) ? 30 : value);
                        }}
                        disabled={loading}
                        className="text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Exclude questions used in the last N days
                      </p>
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={allowPartialSets}
                        onChange={(e) => setAllowPartialSets(e.target.checked)}
                        disabled={loading}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Allow Partial Sets
                      </span>
                    </label>
                    <p className="text-xs text-gray-500">
                      Create set even if fewer questions available
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    loading ||
                    questionTypes.length === 0 ||
                    !selectedTheme ||
                    !goal.trim()
                  }
                  className="w-full"
                >
                  {loading ? "Building..." : "Build Trivia Set"}
                </Button>
              </form>
            )}

            {/* Right Column: Recipe Actions (Recipe Mode) */}
            {mode === "recipe" && (
              <div className="space-y-6">
                {selectedRecipe ? (
                  <>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Selected Recipe
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Name:
                          </span>{" "}
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
                          <span className="font-medium text-gray-700">
                            Types:
                          </span>{" "}
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
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleExecuteRecipe}
                      disabled={loading || !selectedRecipe}
                      className="w-full"
                    >
                      {loading ? "Executing..." : "Execute Recipe"}
                    </Button>
                  </>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                    Select a recipe to execute
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && <Alert type="error" message={error} />}

        {/* Result Display */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Success/Error Banner */}
            {result.status === "success" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold text-lg">
                  ✓ Trivia Set Created Successfully!
                </p>
                {result.finalResult &&
                typeof result.finalResult === "object" &&
                "triviaSet" in result.finalResult ? (
                  <p className="text-sm text-green-700 mt-1">
                    Set ID: {String((result.finalResult as any).triviaSet?.id)}
                  </p>
                ) : null}
              </div>
            )}

            {result.status === "error" && (
              <Alert
                type="error"
                message="Failed to create trivia set. See details below."
              />
            )}

            {/* Execution Summary */}
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Execution Summary
                </h3>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium text-gray-900">
                      {result.status.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Execution Time</p>
                    <p className="font-medium text-gray-900">
                      {result.executionTime}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Process</p>
                    <p className="font-medium text-gray-900">
                      {result.processName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tasks Executed</p>
                    <p className="font-medium text-gray-900">
                      {result.results.length} of 6
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Task Execution Log
                  </h4>
                  <div className="space-y-3">
                    {result.results.map((taskResult, idx) => {
                      const taskProgress = result.taskProgress[idx];
                      const isSuccess = taskResult.success;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${
                            isSuccess
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {isSuccess ? "✓" : "✗"} Task {idx + 1}:{" "}
                                {taskProgress?.taskName || `Task ${idx + 1}`}
                              </p>

                              {taskResult.metadata &&
                                Object.keys(taskResult.metadata).length > 0 && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    {Object.entries(taskResult.metadata).map(
                                      ([key, value]) => (
                                        <div key={key} className="flex gap-2">
                                          <span className="font-medium">
                                            {formatKey(key)}:
                                          </span>
                                          <span>{formatValue(value)}</span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}

                              {taskResult.errors &&
                                taskResult.errors.length > 0 && (
                                  <div className="mt-2">
                                    {taskResult.errors.map((err, errIdx) => (
                                      <p
                                        key={errIdx}
                                        className="text-sm text-red-600"
                                      >
                                        {err.code}: {err.message}
                                      </p>
                                    ))}
                                  </div>
                                )}

                              {taskResult.warnings &&
                                taskResult.warnings.length > 0 && (
                                  <div className="mt-2">
                                    {taskResult.warnings.map(
                                      (warning, warnIdx) => (
                                        <p
                                          key={warnIdx}
                                          className="text-sm text-yellow-600"
                                        >
                                          ⚠️ {warning}
                                        </p>
                                      ),
                                    )}
                                  </div>
                                )}
                            </div>

                            <div className="ml-4 text-sm text-gray-500">
                              {taskProgress?.completedAt &&
                                taskProgress?.startedAt && (
                                  <span>
                                    {new Date(
                                      taskProgress.completedAt,
                                    ).getTime() -
                                      new Date(
                                        taskProgress.startedAt,
                                      ).getTime()}
                                    ms
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {(() => {
                  if (result.status !== "success" || !result.finalResult)
                    return null;
                  const finalResult = result.finalResult;
                  if (
                    typeof finalResult !== "object" ||
                    finalResult === null ||
                    !("triviaSet" in finalResult)
                  )
                    return null;
                  return (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Created Trivia Set
                      </h4>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="space-y-2 text-sm">
                          {(() => {
                            const set = (finalResult as any).triviaSet;
                            return (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-gray-600">ID</p>
                                    <p className="font-medium text-gray-900">
                                      {set.id}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Slug</p>
                                    <p className="font-medium text-gray-900">
                                      {set.slug}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Title</p>
                                    <p className="font-medium text-gray-900">
                                      {set.title}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Question Count
                                    </p>
                                    <p className="font-medium text-gray-900">
                                      {set.question_count}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Category</p>
                                    <p className="font-medium text-gray-900">
                                      {set.category || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Difficulty</p>
                                    <p className="font-medium text-gray-900">
                                      {set.difficulty || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Status</p>
                                    <p className="font-medium text-gray-900">
                                      {set.status}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Visibility</p>
                                    <p className="font-medium text-gray-900">
                                      {set.visibility}
                                    </p>
                                  </div>
                                </div>

                                {set.description && (
                                  <div className="mt-3 pt-3 border-t border-blue-300">
                                    <p className="text-gray-600">Description</p>
                                    <p className="text-gray-900">
                                      {set.description}
                                    </p>
                                  </div>
                                )}

                                {set.tags && set.tags.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-blue-300">
                                    <p className="text-gray-600 mb-2">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                      {set.tags.map(
                                        (tag: string, i: number) => (
                                          <span
                                            key={i}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                          >
                                            {tag}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {result.errors && result.errors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">
                      Overall Errors
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.errors.map((err, idx) => (
                        <li key={idx} className="text-red-700 text-sm">
                          <strong>{err.code}:</strong> {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.warnings && result.warnings.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Warnings
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.warnings.map((warning, idx) => (
                        <li key={idx} className="text-yellow-700 text-sm">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
