"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContentType } from "@/components/content-type-selector";
import { useAuth } from "@/lib/auth-context";
import { CollectionContent, TriviaQuestion } from "@/lib/types";
import { UsageBadges } from "@/components/content-library/usage-badges";

const mainGeneratorTypes: ContentType[] = [
  "multiple-choice",
  "true-false",
  "who-am-i",
  "stat",
  "motivational",
  "greeting",
  "wisdom",
];

interface GenerationJob {
  id: string;
  status: "pending" | "in_progress" | "processing" | "completed" | "failed";
  message: string;
  createdAt: string;
  updatedAt: string;
}

export default function MainGeneratorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedContentType, setSelectedContentType] =
    useState<ContentType | null>(null);
  const [sourceContent, setSourceContent] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContentForDisplay, setGeneratedContentForDisplay] =
    useState("");
  const [structuredDataForSaving, setStructuredDataForSaving] = useState<
    (CollectionContent | TriviaQuestion)[]
  >([]);
  const [generationError, setGenerationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [autoLoadedPrompt, setAutoLoadedPrompt] = useState<string | null>(null);
  const [sourceContentUsedFor, setSourceContentUsedFor] = useState<
    string[] | null
  >(null);
  const [sessionUsedFor, setSessionUsedFor] = useState<string[]>([]); // Track what's been created in this session

  // State for the active bulk job monitoring
  const [activeBulkJob, setActiveBulkJob] = useState<{
    contentId: string;
    contentTitle: string;
    jobs: GenerationJob[];
  } | null>(null);

  // Load content type and prompt from sessionStorage on mount
  // These persist across page navigations (e.g., when loading new source content)
  useEffect(() => {
    const storedPrompt = sessionStorage.getItem("aiPrompt");
    const storedContentType = sessionStorage.getItem(
      "contentType",
    ) as ContentType | null;

    // Check if we're returning from prompts library (new prompt was just loaded)
    const isReturningFromPrompts =
      sessionStorage.getItem("libraryReturnPath") ===
        "/cms/processing/main-generator" &&
      sessionStorage.getItem("promptsLibraryReturn") === "true";

    if (storedPrompt) {
      setAiPrompt(storedPrompt);
      // Only set autoLoadedPrompt if coming from prompts library (new prompt loaded)
      if (isReturningFromPrompts) {
        setAutoLoadedPrompt(storedPrompt);
        sessionStorage.removeItem("promptsLibraryReturn"); // Clear the flag
      }
    }

    if (storedContentType && mainGeneratorTypes.includes(storedContentType)) {
      setSelectedContentType(storedContentType);
    }

    // Clear libraryReturnPath if set (cleanup)
    if (sessionStorage.getItem("libraryReturnPath")) {
      sessionStorage.removeItem("libraryReturnPath");
    }
  }, []);

  // Check for source content from storage on mount and fetch usage data
  useEffect(() => {
    const storedContent = sessionStorage.getItem("sourceContent");
    const storedContentId = sessionStorage.getItem("sourceContentId");
    const storedSessionUsedFor = sessionStorage.getItem("sessionUsedFor");
    const storedSessionContentId = sessionStorage.getItem("sessionContentId"); // Track which content ID the session is for

    if (storedContent) {
      setSourceContent(storedContent);
    }

    // Only restore session tracking if it's for the same source content
    if (
      storedContentId &&
      storedContentId === storedSessionContentId &&
      storedSessionUsedFor
    ) {
      try {
        setSessionUsedFor(JSON.parse(storedSessionUsedFor));
      } catch (error) {
        console.error("Failed to parse sessionUsedFor:", error);
      }
    } else {
      // Reset session tracking if different source content
      setSessionUsedFor([]);
      sessionStorage.removeItem("sessionUsedFor");
    }

    // Fetch usage badges from database if we have a source content ID
    if (storedContentId) {
      sessionStorage.setItem("sessionContentId", storedContentId); // Store which content ID this session is for
      const fetchSourceContentUsage = async () => {
        try {
          const response = await fetch(
            `/api/source-content-ingested?id=${storedContentId}`,
          );
          const result = await response.json();

          if (result.success && result.data && result.data.used_for) {
            setSourceContentUsedFor(result.data.used_for);
          }
        } catch (error) {
          console.error("Failed to fetch source content usage:", error);
        }
      };

      fetchSourceContentUsage();
    } else {
      // Clear everything if no source content ID
      setSourceContentUsedFor(null);
      setSessionUsedFor([]);
      sessionStorage.removeItem("sessionContentId");
    }
  }, []);

  // Persist sessionUsedFor to sessionStorage
  useEffect(() => {
    if (sessionUsedFor.length > 0) {
      sessionStorage.setItem("sessionUsedFor", JSON.stringify(sessionUsedFor));
    } else {
      sessionStorage.removeItem("sessionUsedFor");
    }
  }, [sessionUsedFor]);

  // Persist sourceContent to sessionStorage whenever it changes
  useEffect(() => {
    if (sourceContent) {
      sessionStorage.setItem("sourceContent", sourceContent);
    }
  }, [sourceContent]);

  // Persist aiPrompt to sessionStorage whenever it changes
  useEffect(() => {
    if (aiPrompt) {
      sessionStorage.setItem("aiPrompt", aiPrompt);
    }
  }, [aiPrompt]);

  // Persist selectedContentType to sessionStorage whenever it changes
  useEffect(() => {
    if (selectedContentType) {
      sessionStorage.setItem("contentType", selectedContentType);
    }
  }, [selectedContentType]);

  // Effect to load and monitor an active bulk job from localStorage
  useEffect(() => {
    const activeJobData = localStorage.getItem("activeBulkJob");
    if (activeJobData) {
      setActiveBulkJob(JSON.parse(activeJobData));
    }

    const interval = setInterval(async () => {
      const currentJobData = localStorage.getItem("activeBulkJob");
      if (currentJobData) {
        const parsedData = JSON.parse(currentJobData);
        try {
          const response = await fetch(
            `/api/bulk-generate/jobs?sourceContentId=${parsedData.contentId}`,
          );
          const result = await response.json();
          if (result.success) {
            const updatedJobs = result.data;
            setActiveBulkJob({ ...parsedData, jobs: updatedJobs });

            // Check if all jobs are completed or failed
            const isDone = updatedJobs.every(
              (j: GenerationJob) =>
                j.status === "completed" || j.status === "failed",
            );
            if (isDone) {
              localStorage.removeItem("activeBulkJob");
              // Optionally show a final "completed" message.
            }
          }
        } catch (error) {
          console.error("Failed to poll for job status:", error);
        }
      } else {
        setActiveBulkJob(null); // Clear the panel if the job is removed
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Effect to automatically trigger the background worker when there's an active bulk job
  useEffect(() => {
    if (!activeBulkJob) return;

    // Check if there are any pending or in_progress jobs
    const hasActiveJobs = activeBulkJob.jobs.some(
      (job) => job.status === "pending" || job.status === "in_progress",
    );

    if (!hasActiveJobs) return;

    // Trigger the background worker every 30 seconds
    const workerInterval = setInterval(async () => {
      try {
        console.log("Triggering background worker...");
        await fetch("/api/process-jobs", { method: "POST" });
      } catch (error) {
        console.error("Error triggering background worker:", error);
      }
    }, 30000); // Every 30 seconds

    // Also trigger immediately when the effect runs
    fetch("/api/process-jobs", { method: "POST" }).catch((err) =>
      console.error("Error triggering background worker:", err),
    );

    return () => clearInterval(workerInterval);
  }, [activeBulkJob]);

  const handleCancelBulkGeneration = async () => {
    if (!activeBulkJob) return;

    const confirmCancel = confirm(
      "Are you sure you want to cancel the bulk generation? Pending jobs will be cancelled.",
    );
    if (!confirmCancel) return;

    try {
      // Cancel all pending jobs in the database
      const response = await fetch("/api/bulk-generate/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceContentId: activeBulkJob.contentId }),
      });

      const result = await response.json();
      if (result.success) {
        // Clear the active job from localStorage and state
        localStorage.removeItem("activeBulkJob");
        setActiveBulkJob(null);
        alert("Bulk generation cancelled successfully.");
      } else {
        alert(`Failed to cancel: ${result.error}`);
      }
    } catch (error) {
      console.error("Error cancelling bulk generation:", error);
      alert("Failed to cancel bulk generation.");
    }
  };

  const handleBulkGenerate = async () => {
    if (!sourceContent.trim()) {
      alert("Please add source content first.");
      return;
    }

    setIsBulkGenerating(true);

    try {
      const sourceContentId = sessionStorage.getItem("sourceContentId");
      if (!sourceContentId) {
        alert(
          "Could not find the ID of the source content. Please reload it from the library.",
        );
        setIsBulkGenerating(false);
        return;
      }

      const response = await fetch("/api/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceContentId }),
      });

      const result = await response.json();

      if (result.success) {
        const newJobData = {
          contentId: sourceContentId,
          contentTitle: sourceContent.split(" ").slice(0, 10).join(" ") + "...", // Create a temporary title
          jobs: result.data,
        };
        localStorage.setItem("activeBulkJob", JSON.stringify(newJobData));
        setActiveBulkJob(newJobData);
        alert(
          "Success! Queued 7 generation jobs. You can now monitor their progress at the top of the page.",
        );
      } else {
        throw new Error(result.error || "Failed to start bulk generation.");
      }
    } catch (error) {
      console.error("Failed to start bulk generation:", error);
      alert(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
    } finally {
      setIsBulkGenerating(false);
    }
  };

  // Map content types to API endpoints
  const getApiEndpoint = (contentType: ContentType): string => {
    const endpointMap: Record<ContentType, string> = {
      "multiple-choice": "/api/gemini/generate-multiple-choice",
      "true-false": "/api/gemini/generate-true-false",
      "who-am-i": "/api/gemini/generate-who-am-i",
      stat: "/api/gemini/generate-stats",
      motivational: "/api/gemini/generate-motivational",
      greeting: "/api/gemini/generate-greetings",
      wisdom: "/api/gemini/generate-penalty-box-philosopher",
    };

    return endpointMap[contentType];
  };

  // All content types use the unified save endpoint
  const getSaveEndpoint = (contentType: ContentType): string => {
    return "/api/content/save";
  };

  const handleGenerateContent = async () => {
    if (!selectedContentType) {
      alert("Please select a content type first.");
      return;
    }

    if (!aiPrompt.trim()) {
      alert("Please enter an AI prompt first.");
      return;
    }

    if (!sourceContent.trim()) {
      alert("Please add source content first.");
      return;
    }

    setIsGenerating(true);
    setGeneratedContentForDisplay("");
    setStructuredDataForSaving([]);
    setGenerationError("");
    setSaveSuccess(false);

    try {
      const apiEndpoint = getApiEndpoint(selectedContentType);
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceContent,
          customPrompt: aiPrompt,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // This now handles both uni-content and trivia responses
        setGeneratedContentForDisplay(result.data.generatedContentForDisplay);
        setStructuredDataForSaving(result.data.structuredDataForSaving);
      } else {
        setGenerationError(result.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("Content generation failed:", error);
      setGenerationError("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!selectedContentType) {
      alert("Please select a content type first.");
      return;
    }

    if (structuredDataForSaving.length === 0) {
      alert("No content to save. Please generate content first.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const sourceContentId = sessionStorage.getItem("sourceContentId");
      const saveEndpoint = getSaveEndpoint(selectedContentType);

      if (!saveEndpoint) {
        alert("Could not determine the save endpoint for this content type.");
        setIsSaving(false);
        return;
      }

      const response = await fetch(saveEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemsToSave: structuredDataForSaving,
          sourceContentId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveSuccess(true);
        const contentTypeLabel = selectedContentType
          .replace("-", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        alert(
          `Success! Saved ${result.count || "content"} ${contentTypeLabel} item(s) to the database.`,
        );

        // Track this content type in session
        if (
          selectedContentType &&
          !sessionUsedFor.includes(selectedContentType)
        ) {
          setSessionUsedFor([...sessionUsedFor, selectedContentType]);
        }

        // Refresh usage badges from database after saving
        const sourceContentId = sessionStorage.getItem("sourceContentId");
        if (sourceContentId) {
          try {
            const usageResponse = await fetch(
              `/api/source-content-ingested?id=${sourceContentId}`,
            );
            const usageResult = await usageResponse.json();
            if (
              usageResult.success &&
              usageResult.data &&
              usageResult.data.used_for
            ) {
              setSourceContentUsedFor(usageResult.data.used_for);
            }
          } catch (error) {
            console.error("Failed to refresh usage badges:", error);
          }
        }
      } else {
        alert(`Error: ${result.error || "Failed to save content"}`);
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Main Container */}
      <div className="space-y-8">
        {/* Active Bulk Job Status Panel */}
        {activeBulkJob && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-start justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.636-1.214 2.273-1.214 2.91 0l5.396 10.27c.636 1.214-.214 2.631-1.455 2.631H4.316c-1.24 0-2.09-1.417-1.455-2.631L8.257 3.099zM9 13a1 1 0 112 0 1 1 0 01-2 0zm1-6a1 1 0 00-1 1v3a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Now Processing:{" "}
                    <span className="font-medium">
                      {activeBulkJob.contentTitle}
                    </span>
                  </p>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Progress:{" "}
                      {
                        activeBulkJob.jobs.filter(
                          (j) =>
                            j.status === "completed" || j.status === "failed",
                        ).length
                      }{" "}
                      of {activeBulkJob.jobs.length} jobs complete.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCancelBulkGeneration}
                className="ml-4 px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Header Panel */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              The Main Generator
            </h2>
            {selectedContentType && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-xs font-semibold text-blue-900">
                  {selectedContentType === "multiple-choice" &&
                    "🎯 Multiple Choice"}
                  {selectedContentType === "true-false" && "⚖️ True/False"}
                  {selectedContentType === "who-am-i" && "🎭 Who Am I"}
                  {selectedContentType === "stat" && "📊 Stats"}
                  {selectedContentType === "motivational" && "💪 Motivational"}
                  {selectedContentType === "greeting" && "👋 Greetings"}
                  {selectedContentType === "wisdom" && "✨ Wisdom"}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mt-1">
            Universal content generator. Load your source content, select a
            prompt, and generate any type of content from a single interface.
          </p>
        </div>

        {/* 1. Source Content */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              1. Load Source Content
            </h2>
            <button
              onClick={() => {
                sessionStorage.setItem(
                  "libraryReturnPath",
                  "/cms/processing/main-generator",
                );
                router.push("/cms/library");
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center gap-2"
            >
              📚 Load from Library
            </button>
          </div>
          <textarea
            rows={10}
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            placeholder="Paste your source content here or load from library..."
            className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          />

          {/* Usage Badges - Show what content types have been created from this source */}
          {(sessionUsedFor.length > 0 ||
            (sourceContentUsedFor && sourceContentUsedFor.length > 0)) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-600">
                  Used for:
                </span>
                {/* Show session badges first (what was created in this session) */}
                {sessionUsedFor.length > 0 && (
                  <>
                    <UsageBadges usedFor={sessionUsedFor} />
                    {sourceContentUsedFor &&
                      sourceContentUsedFor.length > 0 && (
                        <span className="text-xs text-gray-400">•</span>
                      )}
                  </>
                )}
                {/* Show database badges (what was created previously) */}
                {sourceContentUsedFor && sourceContentUsedFor.length > 0 && (
                  <UsageBadges usedFor={sourceContentUsedFor} />
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                setSourceContent("");
                setSourceContentUsedFor(null);
                setSessionUsedFor([]);
                sessionStorage.removeItem("sourceContent");
                sessionStorage.removeItem("sourceContentId");
                sessionStorage.removeItem("sessionUsedFor");
                sessionStorage.removeItem("sessionContentId");
              }}
              className="px-4 py-2 bg-transparent border border-indigo-600 text-indigo-600 text-sm font-medium rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* 2. AI Prompt */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              2. Provide AI Prompt
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sessionStorage.setItem(
                    "libraryReturnPath",
                    "/cms/processing/main-generator",
                  );
                  router.push("/cms/prompts-library");
                }}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors flex items-center gap-2"
              >
                📝 Load from Prompts
              </button>
              <button
                onClick={() => {
                  setAiPrompt("");
                  setAutoLoadedPrompt(null);
                  setSelectedContentType(null);
                  sessionStorage.removeItem("aiPrompt");
                  sessionStorage.removeItem("contentType");
                }}
                className="px-4 py-2 bg-transparent border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          {autoLoadedPrompt && aiPrompt === autoLoadedPrompt && (
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 border border-green-200 text-xs font-medium text-green-700">
                <span>✓</span>
                <span>Prompt loaded</span>
              </span>
              {selectedContentType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
                  {selectedContentType === "multiple-choice" &&
                    "🎯 Multiple Choice"}
                  {selectedContentType === "true-false" && "⚖️ True/False"}
                  {selectedContentType === "who-am-i" && "🎭 Who Am I"}
                  {selectedContentType === "stat" && "📊 Stats"}
                  {selectedContentType === "motivational" && "💪 Motivational"}
                  {selectedContentType === "greeting" && "👋 Greetings"}
                  {selectedContentType === "wisdom" && "✨ Wisdom"}
                </span>
              )}
            </div>
          )}
          <textarea
            rows={5}
            value={aiPrompt}
            onChange={(e) => {
              setAiPrompt(e.target.value);
              // Clear auto-loaded indicator if user edits the prompt
              if (autoLoadedPrompt && e.target.value !== autoLoadedPrompt) {
                setAutoLoadedPrompt(null);
                // Clear content type if user edits a loaded prompt
                setSelectedContentType(null);
              }
            }}
            placeholder="Enter your AI prompt here or load from prompts library..."
            className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />

          {/* Show content type selector only for free prompts (no contentType set) */}
          {!selectedContentType && aiPrompt.trim() && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Content Type (required for free prompts)
              </label>
              <div className="flex flex-wrap gap-2">
                {mainGeneratorTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedContentType(type)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      selectedContentType === type
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {type === "multiple-choice" && "🎯 Multiple Choice"}
                    {type === "true-false" && "⚖️ True/False"}
                    {type === "who-am-i" && "🎭 Who Am I"}
                    {type === "stat" && "📊 Stats"}
                    {type === "motivational" && "💪 Motivational"}
                    {type === "greeting" && "👋 Greetings"}
                    {type === "wisdom" && "✨ Wisdom"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Generate */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            3. Generate
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Generate content using your source content and AI prompt.
          </p>
          <div className="flex justify-end gap-3 mt-3">
            <button
              onClick={handleGenerateContent}
              disabled={
                isGenerating ||
                !aiPrompt.trim() ||
                !sourceContent.trim() ||
                !selectedContentType
              }
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? "Generating..." : "Generate Content"}
            </button>
            <button
              onClick={handleBulkGenerate}
              disabled={isBulkGenerating || !sourceContent.trim()}
              className="hidden px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBulkGenerating ? "Queuing Jobs..." : "Generate in Bulk"}
            </button>
          </div>
        </div>

        {/* 6. Generated Content Display */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Generated Content
            </h2>
            {structuredDataForSaving.length > 0 && !generationError && (
              <button
                onClick={handleSaveToDatabase}
                disabled={isSaving || saveSuccess}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving
                  ? "Saving..."
                  : saveSuccess
                    ? "✓ Saved"
                    : "💾 Save to Database"}
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-700 text-sm font-medium">
                ✓ Successfully saved to database!
              </p>
            </div>
          )}

          {generationError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-xs">{generationError}</p>
            </div>
          ) : generatedContentForDisplay ? (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-2">
              <div className="text-xs text-gray-700 whitespace-pre-wrap leading-tight font-mono">
                {generatedContentForDisplay}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 italic">
                Generated content will appear here...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
