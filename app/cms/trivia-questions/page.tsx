"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

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

export default function TriviaQuestionsLibraryPage() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<TriviaQuestion[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] =
    useState<TriviaQuestion | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published"
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "multiple-choice" | "true-false" | "who-am-i"
  >("all");
  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Get unique themes for filter dropdown
  const uniqueThemes = Array.from(
    new Set(questions.map((q) => q.theme).filter(Boolean)),
  ).sort();
  const uniqueTags = Array.from(
    new Set(questions.flatMap((q) => q.tags || [])),
  ).sort();

  // Fetch questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Apply filters whenever questions or filter values change
  useEffect(() => {
    applyFilters();
  }, [questions, searchTerm, statusFilter, typeFilter, themeFilter, tagFilter]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trivia-questions?limit=1000");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch trivia questions");
      }

      setQuestions(result.data || []);
    } catch (err) {
      console.error("Failed to fetch trivia questions:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((q) => q.question_type === typeFilter);
    }

    // Theme filter
    if (themeFilter !== "all") {
      filtered = filtered.filter((q) => q.theme === themeFilter);
    }

    setFilteredQuestions(filtered);
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setThemeFilter("all");
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "Multiple Choice";
      case "true-false":
        return "True/False";
      case "who-am-i":
        return "Who Am I";
      default:
        return type;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "bg-blue-100 text-blue-800";
      case "true-false":
        return "bg-green-100 text-green-800";
      case "who-am-i":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Trivia Questions Library
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Browse and manage individual trivia questions
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as typeof typeFilter)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="who-am-i">Who Am I</option>
            </select>
          </div>

          {/* Theme Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Themes</option>
              {uniqueThemes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Info & Clear */}
        {(typeFilter !== "all" || themeFilter !== "all") && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Showing {filteredQuestions.length} of {questions.length} questions
            </p>
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions List */}
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Questions ({filteredQuestions.length})
              </h3>

              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No questions found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {filteredQuestions.map((question) => (
                    <div
                      key={question.id}
                      onClick={() => setSelectedQuestion(question)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedQuestion?.id === question.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {question.question_text}
                          </p>
                        </div>
                        {question.status === "published" ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {question.theme && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            🏷️ {question.theme}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getQuestionTypeColor(question.question_type)}`}
                        >
                          {getQuestionTypeLabel(question.question_type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(question.created_at)}
                        </span>
                      </div>

                      {question.tags && question.tags.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          {question.tags.slice(0, 5).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Question Detail Panel */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedQuestion ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {selectedQuestion.theme && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        🏷️ {selectedQuestion.theme}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getQuestionTypeColor(selectedQuestion.question_type)}`}
                    >
                      {getQuestionTypeLabel(selectedQuestion.question_type)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        selectedQuestion.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedQuestion.status}
                    </span>
                  </div>
                  {selectedQuestion.tags &&
                    selectedQuestion.tags.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 flex-wrap">
                        <span className="text-xs font-medium text-gray-500 mr-1">
                          Tags:
                        </span>
                        {selectedQuestion.tags.slice(0, 7).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  <p className="text-xs text-gray-500 mb-1 mt-2">
                    ID: {selectedQuestion.id} • Created{" "}
                    {formatDate(selectedQuestion.created_at)}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Question */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                      Question
                    </h4>
                    <p className="text-sm text-gray-900">
                      {selectedQuestion.question_text}
                    </p>
                  </div>

                  {/* Options (Multiple Choice) */}
                  {selectedQuestion.question_type === "multiple-choice" && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Options
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded">
                          <span className="text-xs font-medium text-green-700 mt-0.5">
                            ✓
                          </span>
                          <span className="text-sm text-green-900">
                            {selectedQuestion.correct_answer}
                          </span>
                        </div>
                        {selectedQuestion.wrong_answers.map((answer, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded"
                          >
                            <span className="text-xs font-medium text-gray-500 mt-0.5">
                              ✗
                            </span>
                            <span className="text-sm text-gray-700">
                              {answer}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Answer (True/False or Who Am I) */}
                  {(selectedQuestion.question_type === "true-false" ||
                    selectedQuestion.question_type === "who-am-i") && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Correct Answer
                      </h4>
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm font-medium text-green-900">
                          {selectedQuestion.correct_answer}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                      Metadata
                    </h4>
                    <dl className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Question ID:</dt>
                        <dd className="font-medium text-gray-900">
                          {selectedQuestion.id}
                        </dd>
                      </div>
                      {selectedQuestion.theme && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Theme:</dt>
                          <dd className="font-medium text-gray-900">
                            {selectedQuestion.theme}
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Type:</dt>
                        <dd className="font-medium text-gray-900">
                          {getQuestionTypeLabel(selectedQuestion.question_type)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Status:</dt>
                        <dd className="font-medium text-gray-900 capitalize">
                          {selectedQuestion.status}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Created:</dt>
                        <dd className="font-medium text-gray-900">
                          {formatDate(selectedQuestion.created_at)}
                        </dd>
                      </div>
                      {selectedQuestion.question_type === "multiple-choice" && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Options:</dt>
                          <dd className="font-medium text-gray-900">
                            {selectedQuestion.wrong_answers.length + 1}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No question selected
                </h3>
                <p className="text-xs text-gray-500">
                  Click on a question to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
