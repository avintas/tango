"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  PencilIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { TriviaSet } from "@/lib/supabase";

interface TriviaQuestion {
  id: number;
  question_text: string;
  theme?: string;
  tags?: string[];
  correct_answer: string;
  wrong_answers: string[];
  question_type: "multiple-choice" | "true-false" | "who-am-i";
  status: "draft" | "published";
  created_at: string;
}

export default function EditTriviaSetPage() {
  const router = useRouter();
  const params = useParams();
  const setId = params.id as string;

  // Loading state for initial set data
  const [isLoadingSet, setIsLoadingSet] = useState(true);

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Questions from library
  const [availableQuestions, setAvailableQuestions] = useState<
    TriviaQuestion[]
  >([]);
  const [selectedQuestions, setSelectedQuestions] = useState<TriviaQuestion[]>(
    [],
  );
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Filters for question selection
  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [uniqueThemes, setUniqueThemes] = useState<string[]>([]);

  // Trivia set details (auto-populated)
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [theme, setTheme] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("");

  // Publishing
  const [status, setStatus] = useState<
    "draft" | "review" | "approved" | "archived"
  >("draft");
  const [visibility, setVisibility] = useState<
    "Public" | "Unlisted" | "Private"
  >("Private");

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [triviaSet, setTriviaSet] = useState<TriviaSet | null>(null);

  // Fetch trivia set data on mount
  useEffect(() => {
    if (setId) {
      fetchTriviaSet();
    }
  }, [setId]);

  // Load questions from library
  useEffect(() => {
    fetchQuestions();
  }, []);

  // New, reliable effect for populating selected questions
  useEffect(() => {
    if (triviaSet && availableQuestions.length > 0) {
      const initialSelected = availableQuestions.filter((aq) =>
        triviaSet.question_data.some(
          (sq) =>
            sq.question_text === aq.question_text &&
            sq.correct_answer === aq.correct_answer,
        ),
      );
      setSelectedQuestions(initialSelected);
    }
  }, [triviaSet, availableQuestions]);

  const fetchTriviaSet = async () => {
    setIsLoadingSet(true);
    try {
      const response = await fetch(`/api/trivia-sets?id=${setId}`);
      const result = await response.json();
      if (result.success && result.data) {
        const set: TriviaSet = result.data;
        setTriviaSet(set); // Store the whole set object
        setTitle(set.title);
        setSlug(set.slug);
        setDescription(set.description || "");
        setCategory(set.category || "");
        setTheme(set.theme || "");
        setTags(set.tags || []);
        setDifficulty(set.difficulty || "");
        setStatus(set.status);
        setVisibility(set.visibility);
      } else {
        setSaveMessage(`❌ Error: ${result.error || "Trivia set not found"}`);
      }
    } catch (error) {
      setSaveMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Failed to fetch trivia set"}`,
      );
    } finally {
      setIsLoadingSet(false);
    }
  };

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch("/api/trivia-questions?limit=1000");
      const result = await response.json();

      if (result.success) {
        const questions = result.data || [];
        setAvailableQuestions(questions);

        // If the set is already loaded, try to populate selected questions now
        if (!isLoadingSet) {
          // This needs access to the set data. We'll handle this in the fetchTriviaSet success block.
        }

        // Extract unique themes
        const themes = Array.from(
          new Set(
            result.data.map((q: TriviaQuestion) => q.theme).filter(Boolean),
          ),
        ).sort() as string[];
        setUniqueThemes(themes);
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Auto-generate title, description, and metadata when questions are selected
  useEffect(() => {
    if (selectedQuestions.length > 0) {
      // We disable auto-generation on the edit page to prevent overwriting manual changes
      // autoGenerateMetadata();
    }
  }, [selectedQuestions]);

  const autoGenerateMetadata = () => {
    // Get most common theme
    const themeCounts = selectedQuestions.reduce(
      (acc, q) => {
        if (q.theme) {
          acc[q.theme] = (acc[q.theme] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const dominantTheme =
      Object.keys(themeCounts).sort(
        (a, b) => themeCounts[b] - themeCounts[a],
      )[0] || "Hockey";

    // Get question types
    const types = new Set(selectedQuestions.map((q) => q.question_type));
    const typeLabel =
      types.size === 1
        ? types.has("multiple-choice")
          ? "Multiple Choice"
          : types.has("true-false")
            ? "True/False"
            : types.has("who-am-i")
              ? "Who Am I"
              : ""
        : "Mixed";

    // Generate title
    const generatedTitle = `${dominantTheme} ${typeLabel} Trivia`;

    // Generate description
    const generatedDescription = `Test your knowledge of ${dominantTheme} with ${selectedQuestions.length} engaging ${typeLabel.toLowerCase()} questions. Perfect for hockey fans!`;

    // Generate tags
    const allThemes = Array.from(
      new Set(selectedQuestions.map((q) => q.theme).filter(Boolean)),
    );
    const generatedTags = [...allThemes, "hockey", "trivia"].slice(0, 5);

    setTitle(generatedTitle);
    setDescription(generatedDescription);
    setTheme(dominantTheme);
    setTags(generatedTags);

    // Auto-generate slug
    const generatedSlug = generatedTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setSlug(generatedSlug);
  };

  // Toggle question selection
  const toggleQuestion = (question: TriviaQuestion) => {
    const isSelected = selectedQuestions.find((q) => q.id === question.id);
    if (isSelected) {
      setSelectedQuestions(
        selectedQuestions.filter((q) => q.id !== question.id),
      );
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  // Select all filtered questions
  const selectAllFiltered = () => {
    const filtered = getFilteredQuestions();
    const newSelected = [...selectedQuestions];
    filtered.forEach((q) => {
      if (!newSelected.find((sq) => sq.id === q.id)) {
        newSelected.push(q);
      }
    });
    setSelectedQuestions(newSelected);
  };

  // Select by theme
  const selectByTheme = (themeName: string) => {
    const themeQuestions = availableQuestions.filter(
      (q) => q.theme === themeName,
    );
    const newSelected = [...selectedQuestions];
    themeQuestions.forEach((q) => {
      if (!newSelected.find((sq) => sq.id === q.id)) {
        newSelected.push(q);
      }
    });
    setSelectedQuestions(newSelected);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedQuestions([]);
  };

  // Get filtered questions
  const getFilteredQuestions = () => {
    return availableQuestions.filter((q) => {
      if (themeFilter !== "all" && q.theme !== themeFilter) return false;
      if (typeFilter !== "all" && q.question_type !== typeFilter) return false;
      return true;
    });
  };

  // Transform questions for database
  const transformQuestionsForDB = () => {
    return selectedQuestions.map((q) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      correct_answer: q.correct_answer,
      wrong_answers: q.wrong_answers,
    }));
  };

  // Calculate metadata
  const getFormatType = () => {
    if (selectedQuestions.length === 0) return "Not set";
    const types = new Set(selectedQuestions.map((q) => q.question_type));
    if (types.size === 1) {
      const type = Array.from(types)[0];
      if (type === "multiple-choice") return "Multiple Choice";
      if (type === "true-false") return "True/False";
      if (type === "who-am-i") return "Who Am I";
    }
    return "Mixed";
  };

  // Save trivia set
  const handleSave = async () => {
    if (!title.trim()) {
      setSaveMessage("❌ Please enter a title for the trivia set");
      return;
    }

    if (selectedQuestions.length === 0) {
      setSaveMessage("❌ Please select at least one question");
      return;
    }

    setIsSaving(true);
    setSaveMessage("Updating...");

    try {
      const response = await fetch(`/api/trivia-sets?id=${setId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          category: category || null,
          theme,
          tags,
          difficulty: difficulty || null,
          question_count: selectedQuestions.length,
          question_data: transformQuestionsForDB(),
          status,
          visibility,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update trivia set");
      }

      setSaveMessage("✅ Trivia set updated successfully!");

      setTimeout(() => {
        router.push("/cms/trivia-sets");
      }, 1000);
    } catch (error) {
      setSaveMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back to Trivia Sets
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Trivia Set</h1>
          <p className="text-sm text-gray-600 mt-2">
            Modify the details of your trivia set, add or remove questions, and
            update publishing status.
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              saveMessage.includes("✅")
                ? "bg-green-50 border-green-200 text-green-800"
                : saveMessage.includes("❌")
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <p className="text-sm font-medium">{saveMessage}</p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-3 ${currentStep >= 1 ? "text-indigo-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
              >
                {currentStep > 1 ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  "1"
                )}
              </div>
              <span className="text-sm font-medium">Select Questions</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
            <div
              className={`flex items-center gap-3 ${currentStep >= 2 ? "text-indigo-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
              >
                {currentStep > 2 ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  "2"
                )}
              </div>
              <span className="text-sm font-medium">Review & Customize</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
            <div
              className={`flex items-center gap-3 ${currentStep >= 3 ? "text-indigo-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
              >
                3
              </div>
              <span className="text-sm font-medium">Publish</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Question Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Select by Theme */}
            {uniqueThemes.length > 0 && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Quick Select by Theme
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Click a theme to add all questions from that topic
                </p>
                <div className="flex flex-wrap gap-2">
                  {uniqueThemes.map((themeName) => {
                    const count = availableQuestions.filter(
                      (q) => q.theme === themeName,
                    ).length;
                    return (
                      <button
                        key={themeName}
                        onClick={() => selectByTheme(themeName)}
                        className="px-3 py-2 bg-white border border-blue-300 text-blue-900 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        {themeName} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Filter Questions
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select
                    value={themeFilter}
                    onChange={(e) => setThemeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Themes</option>
                    {uniqueThemes.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Types</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="who-am-i">Who Am I</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {filteredQuestions.length} questions
                </p>
                <button
                  onClick={selectAllFiltered}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Select All Filtered
                </button>
              </div>
            </div>

            {/* Question List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Available Questions ({filteredQuestions.length})
              </h3>

              {isLoadingQuestions ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No questions found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredQuestions.map((question) => {
                    const isSelected = selectedQuestions.find(
                      (q) => q.id === question.id,
                    );
                    return (
                      <div
                        key={question.id}
                        onClick={() => toggleQuestion(question)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isSelected ? (
                              <CheckCircleIcon className="h-5 w-5 text-indigo-600" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                              {question.question_text}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {question.theme && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                  {question.theme}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {question.question_type === "multiple-choice"
                                  ? "MC"
                                  : question.question_type === "true-false"
                                    ? "T/F"
                                    : "Who Am I"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Preview & Settings */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Selection Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Selected Questions
                  </h3>
                  {selectedQuestions.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {selectedQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No questions selected yet</p>
                    <p className="text-xs mt-1">Click questions to add them</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                      {selectedQuestions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-xs text-gray-700 truncate flex-1">
                            {idx + 1}. {q.question_text.substring(0, 40)}...
                          </span>
                          <button
                            onClick={() => toggleQuestion(q)}
                            className="ml-2 text-gray-400 hover:text-red-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Total Questions:</dt>
                          <dd className="font-medium text-gray-900">
                            {selectedQuestions.length}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Format:</dt>
                          <dd className="font-medium text-gray-900">
                            {getFormatType()}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </>
                )}
              </div>

              {/* Auto-Generated Details */}
              {selectedQuestions.length > 0 && (
                <>
                  <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-green-600" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          Auto-Generated
                        </h3>
                      </div>
                      <button
                        onClick={autoGenerateMetadata}
                        className="text-xs text-green-700 hover:text-green-900 font-medium"
                      >
                        Regenerate
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Publishing Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Publishing
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) =>
                            setStatus(e.target.value as typeof status)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="review">Review</option>
                          <option value="approved">Approved</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Visibility
                        </label>
                        <select
                          value={visibility}
                          onChange={(e) =>
                            setVisibility(e.target.value as typeof visibility)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Private">Private</option>
                          <option value="Unlisted">Unlisted</option>
                          <option value="Public">Public</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Difficulty
                        </label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select...</option>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={isSaving || selectedQuestions.length === 0}
                    className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      "Saving Changes..."
                    ) : (
                      <>
                        <PencilIcon className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
