"use client";

import { useReducer } from "react";
import { processText } from "@/lib/text-processing";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import {
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  SparklesIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";

// State interface
interface SourcingState {
  rawContent: string;
  processedContent: string;
  isProcessing: boolean;
  isSaving: boolean;
  saveStatus: { type: "success" | "error" | "info"; message: string };
  copyStatus: { type: "success" | "error" | "info"; message: string };
}

// Action types
type SourcingAction =
  | { type: "SET_RAW_CONTENT"; payload: string }
  | { type: "SET_PROCESSED_CONTENT"; payload: string }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | {
      type: "SET_SAVE_STATUS";
      payload: { type: "success" | "error" | "info"; message: string };
    }
  | {
      type: "SET_COPY_STATUS";
      payload: { type: "success" | "error" | "info"; message: string };
    }
  | { type: "CLEAR_ALL_STATES" }
  | { type: "CLEAR_STATUS_MESSAGES" };

// Initial state
const initialState: SourcingState = {
  rawContent: "",
  processedContent: "",
  isProcessing: false,
  isSaving: false,
  saveStatus: { type: "info", message: "" },
  copyStatus: { type: "info", message: "" },
};

// Reducer function
function sourcingReducer(
  state: SourcingState,
  action: SourcingAction,
): SourcingState {
  switch (action.type) {
    case "SET_RAW_CONTENT":
      return { ...state, rawContent: action.payload };
    case "SET_PROCESSED_CONTENT":
      return { ...state, processedContent: action.payload };
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.payload };
    case "SET_COPY_STATUS":
      return { ...state, copyStatus: action.payload };
    case "CLEAR_ALL_STATES":
      return initialState;
    case "CLEAR_STATUS_MESSAGES":
      return {
        ...state,
        saveStatus: { type: "info", message: "" },
        copyStatus: { type: "info", message: "" },
      };
    default:
      return state;
  }
}

export default function SourcingPage() {
  const [state, dispatch] = useReducer(sourcingReducer, initialState);

  // Helper function to get comprehensive content statistics
  const getContentStats = (text: string) => {
    if (!text.trim()) {
      return {
        words: 0,
        chars: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        avgWordsPerSentence: 0,
      };
    }

    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const chars = text.length;
    const sentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;
    const paragraphs = text
      .split(/\n\n+/)
      .filter((p) => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    const avgWordsPerSentence =
      sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;

    return {
      words,
      chars,
      sentences,
      paragraphs,
      readingTime,
      avgWordsPerSentence,
    };
  };

  // Helper function to count words (for backward compatibility)
  const getWordCount = (text: string) => {
    return getContentStats(text).words;
  };

  // Helper function to clear all states
  const clearAllStates = () => {
    dispatch({ type: "CLEAR_ALL_STATES" });
  };

  const handleProcessContent = async () => {
    if (!state.rawContent.trim()) {
      dispatch({
        type: "SET_SAVE_STATUS",
        payload: { type: "error", message: "There is no content to process." },
      });
      return;
    }
    dispatch({ type: "CLEAR_STATUS_MESSAGES" });
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({
      type: "SET_SAVE_STATUS",
      payload: { type: "info", message: "✨ Processing your content..." },
    });

    try {
      const result = await processText(state.rawContent);
      dispatch({
        type: "SET_PROCESSED_CONTENT",
        payload: result.processedText,
      });
      dispatch({
        type: "SET_SAVE_STATUS",
        payload: {
          type: "success",
          message: "✅ Content processed and ready!",
        },
      });
    } catch (error) {
      dispatch({
        type: "SET_SAVE_STATUS",
        payload: {
          type: "error",
          message: `❌ Processing error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      });
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.trim()) {
        dispatch({ type: "SET_RAW_CONTENT", payload: clipboardText });
        dispatch({ type: "CLEAR_STATUS_MESSAGES" });
        dispatch({
          type: "SET_COPY_STATUS",
          payload: { type: "success", message: "Pasted from clipboard!" },
        });
        setTimeout(() => dispatch({ type: "CLEAR_STATUS_MESSAGES" }), 2000);
      }
    } catch (error) {
      dispatch({
        type: "SET_COPY_STATUS",
        payload: {
          type: "error",
          message: "Failed to read from clipboard.",
        },
      });
      setTimeout(() => dispatch({ type: "CLEAR_STATUS_MESSAGES" }), 2000);
    }
  };

  const handleSave = async () => {
    if (!state.processedContent?.trim()) {
      dispatch({
        type: "SET_SAVE_STATUS",
        payload: {
          type: "error",
          message: "❌ Please process content before saving.",
        },
      });
      return;
    }

    // Clear previous status messages
    dispatch({ type: "CLEAR_STATUS_MESSAGES" });

    dispatch({ type: "SET_SAVING", payload: true });
    dispatch({
      type: "SET_SAVE_STATUS",
      payload: { type: "info", message: "Saving to Supabase..." },
    });

    try {
      const wordCount = getWordCount(state.processedContent);

      const response = await fetch("/api/content-source", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content_text: state.processedContent.trim(),
          word_count: wordCount,
          char_count: state.processedContent.length,
        }),
      });

      const result = await response.json();

      if (result.success) {
        dispatch({
          type: "SET_SAVE_STATUS",
          payload: {
            type: "success",
            message: "✅ Content saved successfully!",
          },
        });
      } else {
        dispatch({
          type: "SET_SAVE_STATUS",
          payload: {
            type: "error",
            message: `❌ Save failed: ${result.error || "Unknown error"}`,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_SAVE_STATUS",
        payload: {
          type: "error",
          message: `❌ Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      });
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  const handleCopy = async () => {
    if (!state.processedContent) return;

    // Clear previous status messages
    dispatch({ type: "CLEAR_STATUS_MESSAGES" });

    try {
      await navigator.clipboard.writeText(state.processedContent);
      dispatch({
        type: "SET_COPY_STATUS",
        payload: { type: "success", message: "✅ Copied to clipboard!" },
      });
      setTimeout(() => dispatch({ type: "CLEAR_STATUS_MESSAGES" }), 2000);
    } catch (error) {
      dispatch({
        type: "SET_COPY_STATUS",
        payload: { type: "error", message: "❌ Failed to copy" },
      });
      setTimeout(() => dispatch({ type: "CLEAR_STATUS_MESSAGES" }), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!state.processedContent) return;

    // Clear previous status messages
    dispatch({ type: "CLEAR_STATUS_MESSAGES" });

    try {
      const blob = new Blob([state.processedContent], {
        type: "text/markdown",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `processed-content-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      dispatch({
        type: "SET_COPY_STATUS",
        payload: { type: "success", message: "📄 Downloaded as Markdown!" },
      });
      setTimeout(() => dispatch({ type: "CLEAR_STATUS_MESSAGES" }), 2000);
    } catch (error) {
      dispatch({
        type: "SET_COPY_STATUS",
        payload: { type: "error", message: "❌ Download failed" },
      });
      setTimeout(() => dispatch({ type: "CLEAR_STATUS_MESSAGES" }), 2000);
    }
  };

  const handleDownloadJSON = () => {
    if (!state.processedContent) return;

    // Clear previous status messages
    dispatch({ type: "CLEAR_STATUS_MESSAGES" });

    try {
      const stats = getContentStats(state.processedContent);
      const jsonData = {
        content: state.processedContent,
        statistics: stats,
        timestamp: new Date().toISOString(),
        metadata: {
          source: "Content Sourcing Tool",
          version: "1.0",
        },
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `processed-content-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      dispatch({
        type: "SET_COPY_STATUS",
        payload: { type: "success", message: "📄 Downloaded as JSON!" },
      });
      setTimeout(() => dispatch({ type: "CLEAR_STATUS_MESSAGES" }), 2000);
    } catch (error) {
      dispatch({
        type: "SET_COPY_STATUS",
        payload: { type: "error", message: "❌ Download failed" },
      });
      setTimeout(() => dispatch({ type: "CLEAR_STATUS_MESSAGES" }), 2000);
    }
  };

  const stats = state.processedContent
    ? getContentStats(state.processedContent)
    : getContentStats("");

  return (
    <div className="bg-gray-50 min-h-screen p-6 space-y-8">
      <Heading>Content Sourcing</Heading>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input and Processing */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Source Content
              </h3>
              <Button variant="ghost" onClick={handlePaste}>
                <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                Paste from Clipboard
              </Button>
            </div>
            <Textarea
              name="rawContent"
              placeholder="Paste or type your raw content here..."
              value={state.rawContent}
              onChange={(e) =>
                dispatch({ type: "SET_RAW_CONTENT", payload: e.target.value })
              }
              className="min-h-[250px] font-mono text-sm"
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleProcessContent}
                disabled={state.isProcessing || !state.rawContent}
                variant="primary"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                {state.isProcessing ? "Processing..." : "Process Content"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Actions and Stats */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={handleSave}
                disabled={state.isSaving || !state.processedContent}
                className="w-full"
                variant="primary"
              >
                <CircleStackIcon className="h-5 w-5 mr-2" />
                {state.isSaving ? "Saving..." : "Save to Library"}
              </Button>
              <Button
                onClick={handleCopy}
                disabled={!state.processedContent}
                className="w-full"
                variant="outline"
              >
                <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                Copy
              </Button>
              <Button
                onClick={handleDownloadMarkdown}
                disabled={!state.processedContent}
                className="w-full"
                variant="outline"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download MD
              </Button>
              <Button
                onClick={handleDownloadJSON}
                disabled={!state.processedContent}
                className="w-full"
                variant="outline"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download JSON
              </Button>
              <div className="pt-2">
                <Button
                  onClick={clearAllStates}
                  disabled={
                    !state.rawContent &&
                    !state.processedContent &&
                    !state.isProcessing &&
                    !state.isSaving
                  }
                  className="w-full"
                  variant="danger"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h3>
            <dl className="divide-y divide-gray-100">
              <div className="px-1 py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-900">Words</dt>
                <dd className="text-sm text-gray-700 col-span-2 text-right">
                  {stats.words}
                </dd>
              </div>
              <div className="px-1 py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-900">
                  Characters
                </dt>
                <dd className="text-sm text-gray-700 col-span-2 text-right">
                  {stats.chars}
                </dd>
              </div>
              <div className="px-1 py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-900">Sentences</dt>
                <dd className="text-sm text-gray-700 col-span-2 text-right">
                  {stats.sentences}
                </dd>
              </div>
              <div className="px-1 py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-900">
                  Paragraphs
                </dt>
                <dd className="text-sm text-gray-700 col-span-2 text-right">
                  {stats.paragraphs}
                </dd>
              </div>
              <div className="px-1 py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-900">
                  Reading Time
                </dt>
                <dd className="text-sm text-gray-700 col-span-2 text-right">
                  ~{stats.readingTime} min
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {(state.saveStatus.message || state.copyStatus.message) && (
        <div className="space-y-3 max-w-2xl mx-auto">
          {state.saveStatus.message && (
            <Alert
              type={state.saveStatus.type}
              message={state.saveStatus.message}
            />
          )}
          {state.copyStatus.message && (
            <Alert
              type={state.copyStatus.type}
              message={state.copyStatus.message}
            />
          )}
        </div>
      )}

      {/* Processed Content Display */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Processed Output
        </h3>
        <div
          className={`w-full rounded-md border p-4 text-sm font-mono whitespace-pre-wrap break-words min-h-[200px] ${
            state.processedContent
              ? "border-green-300 bg-green-50"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          {state.processedContent || (
            <span className="text-gray-400 italic">
              Processed content will appear here...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
