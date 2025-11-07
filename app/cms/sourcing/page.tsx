"use client";

import { useState } from "react";
import { ingestSourceContentAction } from "@/process-builders/ingest-source-content/lib/actions";
import type {
  ProcessBuilderGoal,
  ProcessBuilderRules,
  ProcessBuilderResult,
} from "@/process-builders/core/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import {
  ClipboardDocumentIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { SourceContentIngested } from "@/lib/supabase";
import { processText } from "@/lib/text-processing";

export default function SourcingPage() {
  const [contentText, setContentText] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessBuilderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ingestedContent, setIngestedContent] =
    useState<SourceContentIngested | null>(null);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.trim()) {
        setContentText(clipboardText);
        setProcessedText(""); // Clear processed text when new content is pasted
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleClear = () => {
    setContentText("");
    setProcessedText("");
    setTitle("");
    setResult(null);
    setError(null);
    setIngestedContent(null);
  };

  const handleProcessText = async () => {
    if (!contentText.trim()) {
      setError("Please enter content to process");
      return;
    }

    setIsProcessingText(true);
    setError(null);
    setProcessedText("");

    try {
      const processingResult = await processText(contentText);
      setProcessedText(processingResult.processedText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process text");
    } finally {
      setIsProcessingText(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    setIngestedContent(null);

    try {
      const processGoal: ProcessBuilderGoal = {
        text: "Ingest source content with AI-powered metadata extraction",
      };

      const rules: ProcessBuilderRules = {
        contentText: {
          key: "contentText",
          value: (processedText || contentText).trim(),
          type: "string",
        },
        isAlreadyProcessed: {
          key: "isAlreadyProcessed",
          value: !!processedText, // Set to true if we're using pre-processed text
          type: "boolean",
        },
      };

      if (title.trim()) {
        rules.title = {
          key: "title",
          value: title.trim(),
          type: "string",
        };
      }

      const processResult = await ingestSourceContentAction(processGoal, rules);

      setResult(processResult);

      // Extract ingested content from final result
      if (processResult.status === "success" && processResult.finalResult) {
        const finalData = processResult.finalResult as {
          record?: SourceContentIngested;
        };
        if (finalData.record) {
          setIngestedContent(finalData.record);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const getWordCount = (text: string) => {
    if (!text.trim()) return 0;
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Source Content Ingestion</Heading>
      </div>

      <p className="text-gray-600">
        Process source content through AI-powered workflow to extract metadata,
        generate summaries, and create enriched content records.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="contentText"
              className="block text-sm font-medium text-gray-700"
            >
              Source Content *
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePaste}
                className="text-sm"
                disabled={isProcessingText || loading}
              >
                <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                Paste
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                className="text-sm"
                disabled={
                  isProcessingText ||
                  loading ||
                  (!contentText.trim() && !processedText.trim())
                }
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleProcessText}
                disabled={isProcessingText || loading || !contentText.trim()}
                className="text-sm"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 mr-1 ${isProcessingText ? "animate-spin" : ""}`}
                />
                {isProcessingText ? "Processing..." : "Process Text"}
              </Button>
            </div>
          </div>
          <Textarea
            id="contentText"
            value={contentText}
            onChange={(e) => {
              setContentText(e.target.value);
              setProcessedText(""); // Clear processed text when content changes
            }}
            placeholder="Paste or type your source content here..."
            rows={12}
            required
            disabled={loading || isProcessingText}
            className="font-mono text-sm"
          />
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>{getWordCount(contentText)} words</span>
            <span>{contentText.length} characters</span>
          </div>
        </div>

        {/* Processed Text Display */}
        {processedText && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Processed Content (Ready for Ingestion)
              </label>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setContentText(processedText);
                  setProcessedText("");
                }}
                className="text-sm"
                disabled={loading}
              >
                Use Processed Text
              </Button>
            </div>
            <Textarea
              value={processedText}
              readOnly
              rows={12}
              className="font-mono text-sm bg-gray-50 border-green-300"
            />
            <div className="mt-2 flex items-center gap-4 text-sm text-green-600">
              <span>✓ Processed: {getWordCount(processedText)} words</span>
              <span>{processedText.length} characters</span>
            </div>
          </div>
        )}

        {/* Optional Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title (Optional)
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Leave empty to auto-generate"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            If provided, this title will be used instead of AI-generated title
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={
              loading ||
              isProcessingText ||
              (!contentText.trim() && !processedText.trim())
            }
          >
            {loading ? (
              <>
                <SparklesIcon className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Ingest Content
              </>
            )}
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
                ✓ Content Ingested Successfully!
              </p>
              {ingestedContent && (
                <p className="text-sm text-green-700 mt-1">
                  Record ID: {ingestedContent.id} | Status:{" "}
                  {ingestedContent.ingestion_status}
                </p>
              )}
            </div>
          )}

          {result.status === "error" && (
            <Alert
              type="error"
              message="Failed to ingest content. See details below."
            />
          )}

          {/* Execution Summary */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Workflow Execution Summary
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

              {/* Task Details */}
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
                                <div className="mt-2 text-sm text-gray-600 space-y-1">
                                  {Object.entries(taskResult.metadata).map(
                                    ([key, value]) => (
                                      <div key={key} className="flex gap-2">
                                        <span className="font-medium capitalize">
                                          {key
                                            .replace(/([A-Z])/g, " $1")
                                            .trim()}
                                          :
                                        </span>
                                        <span>
                                          {typeof value === "object"
                                            ? JSON.stringify(value)
                                            : String(value)}
                                        </span>
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ingested Content Details */}
              {result.status === "success" && ingestedContent && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Ingested Content Details
                  </h4>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">ID</p>
                        <p className="font-medium text-gray-900">
                          {ingestedContent.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Theme</p>
                        <p className="font-medium text-gray-900">
                          {ingestedContent.theme}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium text-gray-900">
                          {ingestedContent.category || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium text-gray-900">
                          {ingestedContent.ingestion_status}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    {ingestedContent.title && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Title</p>
                        <p className="font-medium text-gray-900">
                          {ingestedContent.title}
                        </p>
                      </div>
                    )}

                    {/* Summary */}
                    {ingestedContent.summary && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Summary</p>
                        <p className="text-gray-900">
                          {ingestedContent.summary}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {ingestedContent.tags &&
                      ingestedContent.tags.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {ingestedContent.tags.map((tag, i) => (
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

                    {/* Key Phrases */}
                    {ingestedContent.key_phrases &&
                      ingestedContent.key_phrases.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Key Phrases
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {ingestedContent.key_phrases.map((phrase, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs"
                              >
                                {phrase}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-blue-300">
                      <div>
                        <p className="text-sm text-gray-600">Word Count</p>
                        <p className="font-medium text-gray-900">
                          {ingestedContent.word_count || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Character Count</p>
                        <p className="font-medium text-gray-900">
                          {ingestedContent.char_count || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            ingestedContent.created_at,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
