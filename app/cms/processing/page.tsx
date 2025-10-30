"use client";

import { useReducer } from "react";

// State interface
interface ProcessingState {
  mode: "ai" | "direct";
  selectedCard: string;
  promptContent: string;
  sourceContent: string;
  isGenerating: boolean;
  generatedContent: string;
  generationError: string;
  title: string;
  status: "draft" | "published";
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string;
  directInputContent: string;
}

// Action types
type ProcessingAction =
  | { type: "SET_MODE"; payload: "ai" | "direct" }
  | { type: "SET_SELECTED_CARD"; payload: string }
  | { type: "SET_PROMPT_CONTENT"; payload: string }
  | { type: "SET_SOURCE_CONTENT"; payload: string }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "SET_GENERATED_CONTENT"; payload: string }
  | { type: "SET_GENERATION_ERROR"; payload: string }
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_STATUS"; payload: "draft" | "published" }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_SAVE_SUCCESS"; payload: boolean }
  | { type: "SET_SAVE_ERROR"; payload: string }
  | { type: "SET_DIRECT_INPUT_CONTENT"; payload: string }
  | { type: "RESET_SAVE_FORM" };

// Initial state
const initialState: ProcessingState = {
  mode: "ai",
  selectedCard: "trivia_sets",
  promptContent: "",
  sourceContent: "",
  isGenerating: false,
  generatedContent: "",
  generationError: "",
  title: "",
  status: "draft",
  isSaving: false,
  saveSuccess: false,
  saveError: "",
  directInputContent: "",
};

// Reducer function
function processingReducer(
  state: ProcessingState,
  action: ProcessingAction,
): ProcessingState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_SELECTED_CARD":
      return { ...state, selectedCard: action.payload };
    case "SET_PROMPT_CONTENT":
      return { ...state, promptContent: action.payload };
    case "SET_SOURCE_CONTENT":
      return { ...state, sourceContent: action.payload };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload };
    case "SET_GENERATED_CONTENT":
      return { ...state, generatedContent: action.payload };
    case "SET_GENERATION_ERROR":
      return { ...state, generationError: action.payload };
    case "SET_TITLE":
      return { ...state, title: action.payload };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_SAVE_SUCCESS":
      return { ...state, saveSuccess: action.payload };
    case "SET_SAVE_ERROR":
      return { ...state, saveError: action.payload };
    case "SET_DIRECT_INPUT_CONTENT":
      return { ...state, directInputContent: action.payload };
    case "RESET_SAVE_FORM":
      return {
        ...state,
        title: "",
        status: "draft",
        saveSuccess: false,
        saveError: "",
        generatedContent: "",
        directInputContent: "",
      };
    default:
      return state;
  }
}

export default function ProcessingPage() {
  const [state, dispatch] = useReducer(processingReducer, initialState);

  // Content type cards
  const contentTypes = [
    {
      id: "trivia_sets",
      name: "Trivia Sets",
      description: "Daily trivia questions",
      icon: "🎯",
      color: "bg-purple-500",
    },
    {
      id: "statistics",
      name: "Statistics",
      description: "Statistical data",
      icon: "📊",
      color: "bg-green-500",
    },
    {
      id: "motivational",
      name: "Motivational",
      description: "Inspirational content",
      icon: "💪",
      color: "bg-pink-500",
    },
    {
      id: "greeting",
      name: "Greetings",
      description: "Welcome messages",
      icon: "👋",
      color: "bg-indigo-500",
    },
  ];

  // Map content type IDs to database values
  const contentTypeMapping: Record<string, string> = {
    trivia_sets: "trivia",
    statistics: "statistics",
    motivational: "motivational",
    greeting: "greeting",
  };

  const handleCardClick = (cardId: string) => {
    dispatch({ type: "SET_SELECTED_CARD", payload: cardId });

    // Reset prompt content when switching cards
    dispatch({ type: "SET_PROMPT_CONTENT", payload: "" });
  };

  const handleGenerateContent = async () => {
    if (!state.promptContent.trim()) {
      alert("Please enter an AI prompt first.");
      return;
    }

    if (!state.sourceContent.trim()) {
      alert("Please add source content first.");
      return;
    }

    dispatch({ type: "SET_GENERATING", payload: true });
    dispatch({ type: "SET_GENERATION_ERROR", payload: "" });

    try {
      // Use the existing Gemini API endpoint
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: state.sourceContent,
          contentType: "trivia_questions", // Default to trivia, could be made dynamic based on selectedCard
          numItems: 5,
          customPrompt: state.promptContent, // Use the user's custom prompt
        }),
      });

      const result = await response.json();

      if (result.success) {
        dispatch({
          type: "SET_GENERATED_CONTENT",
          payload: JSON.stringify(result.content, null, 2),
        });
      } else {
        dispatch({
          type: "SET_GENERATION_ERROR",
          payload: result.error || "Failed to generate content",
        });
      }
    } catch (error) {
      console.error("Content generation failed:", error);
      dispatch({
        type: "SET_GENERATION_ERROR",
        payload: "Failed to generate content. Please try again.",
      });
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
    }
  };

  const handleSaveContent = async () => {
    // Validation
    if (!state.title.trim()) {
      alert("Please enter a title for this content.");
      return;
    }

    const contentToSave =
      state.mode === "ai" ? state.generatedContent : state.directInputContent;

    if (!contentToSave.trim()) {
      alert("No content to save. Please generate or enter content first.");
      return;
    }

    dispatch({ type: "SET_SAVING", payload: true });
    dispatch({ type: "SET_SAVE_ERROR", payload: "" });
    dispatch({ type: "SET_SAVE_SUCCESS", payload: false });

    try {
      const response = await fetch("/api/content-processed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: state.title.trim(),
          content_type: contentTypeMapping[state.selectedCard] || "trivia",
          markdown_content: contentToSave.trim(),
          status: state.status,
        }),
      });

      const result = await response.json();

      if (result.success) {
        dispatch({ type: "SET_SAVE_SUCCESS", payload: true });
        setTimeout(() => {
          dispatch({ type: "RESET_SAVE_FORM" });
        }, 2000);
      } else {
        dispatch({
          type: "SET_SAVE_ERROR",
          payload: result.error || "Failed to save content",
        });
      }
    } catch (error) {
      console.error("Save failed:", error);
      dispatch({
        type: "SET_SAVE_ERROR",
        payload: "Failed to save content. Please try again.",
      });
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Processing Section */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Content Processing
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate or input structured content
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between max-w-md">
              <span className="flex grow flex-col">
                <label
                  id="mode-toggle-label"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  {state.mode === "ai"
                    ? "AI Generation Mode"
                    : "Direct Input Mode"}
                </label>
                <span
                  id="mode-toggle-description"
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  {state.mode === "ai"
                    ? "Generate content using AI prompts and source material"
                    : "Paste pre-formatted content directly"}
                </span>
              </span>
              <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2">
                <span className="size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5" />
                <input
                  id="mode-toggle"
                  name="mode-toggle"
                  type="checkbox"
                  checked={state.mode === "direct"}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_MODE",
                      payload: e.target.checked ? "direct" : "ai",
                    })
                  }
                  aria-labelledby="mode-toggle-label"
                  aria-describedby="mode-toggle-description"
                  className="absolute inset-0 appearance-none focus:outline-hidden cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6">
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* "What do you want to produce?" Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              What do you want to produce?
            </h3>

            {/* Content Type Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {contentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleCardClick(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    state.selectedCard === type.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-200 bg-white dark:bg-gray-800 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center text-white text-xl mx-auto mb-3`}
                    >
                      {type.icon}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {type.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Generation Mode */}
          {state.mode === "ai" && (
            <>
              {/* AI Prompt Area */}
              <div className="mb-6">
                <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    AI Prompt
                  </h3>

                  <textarea
                    value={state.promptContent}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_PROMPT_CONTENT",
                        payload: e.target.value,
                      })
                    }
                    placeholder="Enter or paste your AI prompt here..."
                    className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 min-h-[120px] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical"
                  />
                </div>
              </div>

              {/* Source Content Input */}
              <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Source Content
                </h3>

                <textarea
                  value={state.sourceContent}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SOURCE_CONTENT",
                      payload: e.target.value,
                    })
                  }
                  placeholder="Paste your source content here..."
                  className="w-full min-h-[200px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                />

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {state.sourceContent ? (
                      <>
                        <span className="font-medium">
                          {
                            state.sourceContent.split(/\s+/).filter(Boolean)
                              .length
                          }
                        </span>{" "}
                        words •{" "}
                        <span className="font-medium">
                          {state.sourceContent.length}
                        </span>{" "}
                        characters
                      </>
                    ) : (
                      <span>No content added yet</span>
                    )}
                  </div>
                  <button
                    onClick={handleGenerateContent}
                    disabled={
                      state.isGenerating ||
                      !state.promptContent.trim() ||
                      !state.sourceContent.trim()
                    }
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.isGenerating ? "Generating..." : "Generate Content"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Direct Input Mode */}
          {state.mode === "direct" && (
            <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Formatted Content
              </h3>

              <textarea
                value={state.directInputContent}
                onChange={(e) =>
                  dispatch({
                    type: "SET_DIRECT_INPUT_CONTENT",
                    payload: e.target.value,
                  })
                }
                placeholder="Paste your pre-formatted content here (markdown format)..."
                className="w-full min-h-[400px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono"
              />

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                {state.directInputContent ? (
                  <>
                    <span className="font-medium">
                      {
                        state.directInputContent.split(/\s+/).filter(Boolean)
                          .length
                      }
                    </span>{" "}
                    words •{" "}
                    <span className="font-medium">
                      {state.directInputContent.length}
                    </span>{" "}
                    characters
                  </>
                ) : (
                  <span>No content added yet</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated Content Display (AI Mode) */}
      {state.mode === "ai" &&
        (state.generatedContent || state.generationError) && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Generated Content
              </h3>

              {state.generationError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {state.generationError}
                  </p>
                </div>
              ) : state.generatedContent ? (
                <div className="bg-green-50 dark:bg-gray-900 rounded-lg border border-green-200 dark:border-gray-700 p-4 mb-6">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {state.generatedContent}
                  </pre>
                </div>
              ) : null}
            </div>
          </div>
        )}

      {/* Save Form (shown when content exists) */}
      {((state.mode === "ai" && state.generatedContent) ||
        (state.mode === "direct" && state.directInputContent)) && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save Content
            </h3>

            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={state.title}
                onChange={(e) =>
                  dispatch({ type: "SET_TITLE", payload: e.target.value })
                }
                placeholder="Enter a title for this content..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={state.status === "draft"}
                    onChange={() =>
                      dispatch({ type: "SET_STATUS", payload: "draft" })
                    }
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Draft
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={state.status === "published"}
                    onChange={() =>
                      dispatch({ type: "SET_STATUS", payload: "published" })
                    }
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Published
                  </span>
                </label>
              </div>
            </div>

            {/* Success Message */}
            {state.saveSuccess && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                  ✓ Content saved successfully to database!
                </p>
              </div>
            )}

            {/* Error Message */}
            {state.saveError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {state.saveError}
                </p>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveContent}
              disabled={state.isSaving || !state.title.trim()}
              className="w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.isSaving ? "Saving..." : "Save to Database"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
