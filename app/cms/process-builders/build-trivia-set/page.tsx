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
import ThemeCategorySelector from "@/components/theme-category-selector";
import type { Theme } from "@/components/theme-selector";
import type { SourceContentCategory } from "@/lib/supabase";

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

export default function BuildTriviaSetPage() {
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

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessBuilderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update goal when theme/category changes
  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    // Auto-populate goal with theme name if empty
    if (!goal.trim()) {
      setGoal(theme);
    }
  };

  const handleCategorySelect = (category: SourceContentCategory | null) => {
    setSelectedCategory(category);
  };

  // Update goal when theme or category changes
  useEffect(() => {
    if (selectedTheme) {
      if (selectedCategory) {
        setGoal(`${selectedTheme} - ${selectedCategory}`);
      } else {
        setGoal(selectedTheme);
      }
    }
  }, [selectedTheme, selectedCategory]);

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
        // Note: onProgress callback cannot be passed to server actions
        // Progress tracking happens server-side and is returned in taskProgress
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Heading level={1}>Build Trivia Set</Heading>
      <p className="text-gray-600">
        Create a curated trivia set from existing questions. Enter a theme and
        configure the rules.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Theme and Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme & Category *
          </label>
          <ThemeCategorySelector
            selectedTheme={selectedTheme}
            selectedCategory={selectedCategory}
            onThemeSelect={handleThemeSelect}
            onCategorySelect={handleCategorySelect}
          />
          <p className="mt-3 text-sm text-gray-500">
            Select a theme to filter questions. Optionally refine with a
            category.
          </p>
        </div>

        {/* Goal Input (auto-populated but editable) */}
        <div>
          <label
            htmlFor="goal"
            className="block text-sm font-medium text-gray-700 mb-2"
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
          />
          <p className="mt-1 text-sm text-gray-500">
            This will be used to match and select questions. Auto-populated from
            your theme/category selection, but you can customize it.
          </p>
        </div>

        {/* Question Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Types *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={questionTypes.includes("TMC")}
                onChange={() => toggleQuestionType("TMC")}
                disabled={loading}
                className="mr-2"
              />
              <span>Multiple Choice (TMC)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={questionTypes.includes("TFT")}
                onChange={() => toggleQuestionType("TFT")}
                disabled={loading}
                className="mr-2"
              />
              <span>True/False (TFT)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={questionTypes.includes("WAI")}
                onChange={() => toggleQuestionType("WAI")}
                disabled={loading}
                className="mr-2"
              />
              <span>Who Am I (WAI)</span>
            </label>
          </div>
          {questionTypes.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              At least one question type is required
            </p>
          )}
        </div>

        {/* Question Count */}
        <div>
          <label
            htmlFor="questionCount"
            className="block text-sm font-medium text-gray-700 mb-2"
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
          />
        </div>

        {/* Distribution Strategy */}
        <div>
          <label
            htmlFor="distributionStrategy"
            className="block text-sm font-medium text-gray-700 mb-2"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="even">Even Split</option>
            <option value="weighted">Weighted by Availability</option>
            <option value="custom">Custom</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            How to distribute questions across types
          </p>
        </div>

        {/* Cooldown Days */}
        <div>
          <label
            htmlFor="cooldownDays"
            className="block text-sm font-medium text-gray-700 mb-2"
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
          />
          <p className="mt-1 text-sm text-gray-500">
            Exclude questions used in the last N days (0 = no cooldown)
          </p>
        </div>

        {/* Allow Partial Sets */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={allowPartialSets}
              onChange={(e) => setAllowPartialSets(e.target.checked)}
              disabled={loading}
              className="mr-2"
            />
            <span>Allow Partial Sets</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Create set even if fewer questions are available than requested
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={
              loading ||
              questionTypes.length === 0 ||
              !selectedTheme ||
              !goal.trim()
            }
          >
            {loading ? "Building..." : "Build Trivia Set"}
          </Button>
        </div>
      </form>

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
          <div className="border rounded-lg overflow-hidden">
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

                            {/* Task metadata */}
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

                            {/* Task errors */}
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

                            {/* Task warnings */}
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
                                    new Date(taskProgress.startedAt).getTime()}
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
                                    {set.tags.map((tag: string, i: number) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                      >
                                        {tag}
                                      </span>
                                    ))}
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

              {/* Overall Errors */}
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

              {/* Overall Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
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
  );
}
