"use client";

import { useState } from "react";
import type { AnalysisRequest, AnalysisResult } from "../lib/types";

interface BatchAnalyzerProps {
  contentIds: number[];
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

/**
 * Batch Analyzer Component
 * Analyzes multiple content records using Gemini
 */
export function BatchAnalyzer({
  contentIds,
  onAnalysisComplete,
}: BatchAnalyzerProps) {
  const [analysisType, setAnalysisType] =
    useState<AnalysisRequest["analysisType"]>("pattern-discovery");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (contentIds.length === 0) {
      setError("Please select at least one content item to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ideation/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentIds,
          analysisType,
          prompt: customPrompt.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      const analysisResult = data.data as AnalysisResult;
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Analysis Type
        </label>
        <select
          value={analysisType}
          onChange={(e) =>
            setAnalysisType(e.target.value as AnalysisRequest["analysisType"])
          }
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="pattern-discovery">Pattern Discovery</option>
          <option value="content-synthesis">Content Synthesis</option>
          <option value="quality-assessment">Quality Assessment</option>
          <option value="opportunity-identification">
            Opportunity Identification
          </option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Prompt (Optional)
        </label>
        <textarea
          rows={3}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Add custom instructions for analysis..."
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || contentIds.length === 0}
        className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? "Analyzing..." : `Analyze ${contentIds.length} Item(s)`}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {result && result.success && (
        <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-md">
          {result.insights && result.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Insights
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {result.insights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Recommendations
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {result.opportunities && result.opportunities.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Opportunities
              </h4>
              <div className="space-y-2">
                {result.opportunities.map((opp, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white rounded border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {opp.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          opp.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : opp.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {opp.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {opp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
