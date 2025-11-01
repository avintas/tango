"use client";

import { useReducer } from "react";
import ContentTypeSelector, {
  ContentType,
} from "@/components/content-type-selector";
import { useAuth } from "@/lib/auth-context";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import {
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";

// State interface
interface PromptCreationState {
  promptName: string;
  promptContent: string;
  contentType: ContentType | null;
  isSaving: boolean;
  saveStatus: { type: "success" | "error" | "info"; message: string };
  copyStatus: { type: "success" | "error" | "info"; message: string };
}

// Action types
type PromptCreationAction =
  | { type: "SET_PROMPT_NAME"; payload: string }
  | { type: "SET_PROMPT_CONTENT"; payload: string }
  | { type: "SET_CONTENT_TYPE"; payload: ContentType }
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
const initialState: PromptCreationState = {
  promptName: "",
  promptContent: "",
  contentType: null,
  isSaving: false,
  saveStatus: { type: "info", message: "" },
  copyStatus: { type: "info", message: "" },
};

// Reducer function
function promptCreationReducer(
  state: PromptCreationState,
  action: PromptCreationAction,
): PromptCreationState {
  switch (action.type) {
    case "SET_PROMPT_NAME":
      return { ...state, promptName: action.payload };
    case "SET_PROMPT_CONTENT":
      return { ...state, promptContent: action.payload };
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

const allowedPromptTypes: ContentType[] = [
  "multiple-choice",
  "true-false",
  "who-am-i",
  "stat",
  "motivational",
  "greeting",
  "wisdom",
];

export default function PromptCreationPage() {
  const [state, dispatch] = useReducer(promptCreationReducer, initialState);
  const { user } = useAuth();

  // Helper function to get character count
  const getCharCount = (text: string) => {
    return text.length;
  };

  // Helper function to clear all states
  const clearAllStates = () => {
    dispatch({ type: "CLEAR_ALL_STATES" });
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.trim()) {
        dispatch({ type: "SET_PROMPT_CONTENT", payload: clipboardText });
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
    if (!state.promptContent?.trim()) {
      dispatch({
        type: "SET_SAVE_STATUS",
        payload: {
          type: "error",
          message: "❌ Please add prompt content before saving.",
        },
      });
      return;
    }

    if (!state.contentType) {
      dispatch({
        type: "SET_SAVE_STATUS",
        payload: {
          type: "error",
          message: "❌ Please select a content type before saving.",
        },
      });
      return;
    }

    // Clear previous status messages
    dispatch({ type: "CLEAR_STATUS_MESSAGES" });

    dispatch({ type: "SET_SAVING", payload: true });
    dispatch({
      type: "SET_SAVE_STATUS",
      payload: { type: "info", message: "Saving to database..." },
    });

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt_name: state.promptName.trim() || null,
          prompt_content: state.promptContent.trim(),
          content_type: state.contentType,
          created_by: user?.id || null,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save prompt");
      }

      dispatch({
        type: "SET_SAVE_STATUS",
        payload: {
          type: "success",
          message: "✅ Prompt saved successfully!",
        },
      });
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
    if (!state.promptContent) return;

    // Clear previous status messages
    dispatch({ type: "CLEAR_STATUS_MESSAGES" });

    try {
      await navigator.clipboard.writeText(state.promptContent);
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
    if (!state.promptContent) return;

    // Clear previous status messages
    dispatch({ type: "CLEAR_STATUS_MESSAGES" });

    try {
      const blob = new Blob([state.promptContent], {
        type: "text/markdown",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompt-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.md`;
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
    if (!state.promptContent) return;

    // Clear previous status messages
    dispatch({ type: "CLEAR_STATUS_MESSAGES" });

    try {
      const jsonData = {
        prompt: state.promptContent,
        timestamp: new Date().toISOString(),
        metadata: {
          source: "Prompt Creation Tool",
          version: "1.0",
        },
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompt-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
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

  return (
    <div className="bg-gray-50 min-h-screen p-6 space-y-8">
      <Heading>Create New Prompt</Heading>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Prompt Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="space-y-4">
              <Input
                name="promptName"
                placeholder="Enter a name for your prompt (optional)"
                value={state.promptName}
                onChange={(e) =>
                  dispatch({
                    type: "SET_PROMPT_NAME",
                    payload: e.target.value,
                  })
                }
              />
              <div className="flex justify-end">
                <Button variant="ghost" onClick={handlePaste}>
                  <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                  Paste from Clipboard
                </Button>
              </div>
              <Textarea
                name="promptContent"
                placeholder="Paste or type your prompt content here..."
                value={state.promptContent}
                onChange={(e) =>
                  dispatch({
                    type: "SET_PROMPT_CONTENT",
                    payload: e.target.value,
                  })
                }
                className="min-h-[400px] font-mono text-sm"
              />
              <div className="text-right text-sm text-gray-500">
                {getCharCount(state.promptContent)} characters
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration and Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Content Type
            </h3>
            <ContentTypeSelector
              selectedType={state.contentType}
              onTypeSelect={(type: ContentType) =>
                dispatch({ type: "SET_CONTENT_TYPE", payload: type })
              }
              allowedTypes={allowedPromptTypes}
            />
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={handleSave}
                disabled={
                  state.isSaving || !state.promptContent || !state.contentType
                }
                className="w-full"
                variant="primary"
              >
                <CircleStackIcon className="h-5 w-5 mr-2" />
                {state.isSaving ? "Saving..." : "Save Prompt"}
              </Button>
              <Button
                onClick={handleCopy}
                disabled={!state.promptContent}
                className="w-full"
                variant="outline"
              >
                <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                Copy
              </Button>
              <Button
                onClick={handleDownloadMarkdown}
                disabled={!state.promptContent}
                className="w-full"
                variant="outline"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download MD
              </Button>
              <Button
                onClick={handleDownloadJSON}
                disabled={!state.promptContent}
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
                    !state.promptContent && !state.promptName && !state.isSaving
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
    </div>
  );
}
