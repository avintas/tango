"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import type {
  IdeationContext,
  ContentSelection,
  IdeationPlan,
  PlanParameters,
} from "@/ideation";
import {
  createIdeationContext,
  addSelection,
  removeSelection,
  updateFilters,
  buildPlanFromContext,
  exportPlanForExecution,
} from "@/ideation";
import type { SourceContentIngested } from "@/lib/supabase";
import { ThemeExplorer } from "@/ideation/components/theme-explorer";
import { ContentBrowser } from "@/ideation/components/content-browser";
import { BatchAnalyzer } from "@/ideation/components/batch-analyzer";
import { PlanViewer } from "@/ideation/components/plan-viewer";
import CategoryExplorer from "@/components/ideation/category-explorer";
import type { ExplorationFilters } from "@/ideation";

export default function IdeationPage() {
  const [context, setContext] = useState<IdeationContext>(
    createIdeationContext(),
  );
  const [currentPlan, setCurrentPlan] = useState<IdeationPlan | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | undefined>();
  const [showBatchAnalyzer, setShowBatchAnalyzer] = useState(false);

  const handleContentSelect = (content: SourceContentIngested) => {
    const selection: ContentSelection = {
      id: Date.now(),
      type: "source-content",
      contentId: content.id,
      metadata: {
        theme: content.theme,
        category: content.category,
        tags: content.tags,
        title: content.title,
      },
    };

    // Check if already selected
    const isSelected = context.selections.some(
      (s) => s.contentId === content.id && s.type === "source-content",
    );

    if (isSelected) {
      setContext(removeSelection(context, selection.id));
    } else {
      setContext(addSelection(context, selection));
    }
  };

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setContext(
      updateFilters(context, {
        themes: theme ? [theme] : undefined,
      }),
    );
  };

  const handleBuildPlan = () => {
    if (context.selections.length === 0) {
      alert("Please select at least one content item");
      return;
    }

    const parameters: PlanParameters = {
      theme: selectedTheme,
    };

    const plan = buildPlanFromContext(
      context,
      "content-selection",
      parameters,
      {
        description: `Plan with ${context.selections.length} selected items`,
      },
    );

    if (plan) {
      setCurrentPlan(plan);
    }
  };

  const handleExecutePlan = () => {
    if (!currentPlan) return;

    const exported = exportPlanForExecution(currentPlan);
    console.log("Executing plan:", exported);

    // Store plan in sessionStorage for process builder
    sessionStorage.setItem("ideationPlan", JSON.stringify(currentPlan));

    // Navigate to appropriate page based on plan type
    // For now, navigate to main generator with selections
    if (currentPlan.selections.length > 0) {
      const firstSelection = currentPlan.selections[0];
      if (firstSelection.type === "source-content") {
        // Load first selected content into main generator
        // This would require fetching the content and setting it in sessionStorage
        window.location.href = "/cms/processing/main-generator";
      }
    }
  };

  const selectedContentIds = context.selections
    .filter((s) => s.type === "source-content")
    .map((s) => s.contentId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Heading>Ideation</Heading>
        <p className="text-sm text-gray-600">
          Explore content, analyze patterns, and build plans for content
          generation.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Exploration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Explorer - Shows available content by category */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <CategoryExplorer />
            </div>

            {/* Theme Explorer */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ThemeExplorer
                onThemeSelect={handleThemeSelect}
                selectedTheme={selectedTheme}
              />
            </div>

            {/* Content Browser */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ContentBrowser
                filters={context.filters}
                onContentSelect={handleContentSelect}
                selectedIds={selectedContentIds}
                multiSelect={true}
              />
            </div>

            {/* Batch Analyzer */}
            {showBatchAnalyzer && selectedContentIds.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">
                    Batch Analysis
                  </h2>
                  <button
                    onClick={() => setShowBatchAnalyzer(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <BatchAnalyzer contentIds={selectedContentIds} />
              </div>
            )}
          </div>

          {/* Right Column: Selections & Plan */}
          <div className="space-y-6">
            {/* Selected Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  Selected ({context.selections.length})
                </h2>
                {context.selections.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBatchAnalyzer(true)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                    >
                      Analyze
                    </button>
                    <button
                      onClick={() => setContext(createIdeationContext())}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {context.selections.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Select content items to build a plan
                </p>
              ) : (
                <div className="space-y-2">
                  {context.selections.map((selection) => (
                    <div
                      key={selection.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <span className="text-xs text-gray-700">
                        {selection.type} #{selection.contentId}
                      </span>
                      <button
                        onClick={() =>
                          setContext(removeSelection(context, selection.id))
                        }
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Plan Builder */}
            {context.selections.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Build Plan
                </h2>
                <button
                  onClick={handleBuildPlan}
                  className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500"
                >
                  Create Plan
                </button>
              </div>
            )}

            {/* Plan Viewer */}
            {currentPlan && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Current Plan
                </h2>
                <PlanViewer plan={currentPlan} onExecute={handleExecutePlan} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
