"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

interface TriviaQuestion {
  id: number;
  question_text: string;
  theme?: string;
  tags?: string[];
  correct_answer: string;
  wrong_answers: string[];
  question_type: "multiple-choice" | "true-false" | "who-am-i";
  status: "draft" | "published" | "archived";
  created_at: string;
}

export default function ArchivedTriviaQuestionsPage() {
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
  const [typeFilter, setTypeFilter] = useState<
    "all" | "multiple-choice" | "true-false" | "who-am-i"
  >("all");
  const [themeFilter, setThemeFilter] = useState<string>("all");

  // Get unique themes for filter dropdown
  const uniqueThemes = Array.from(
    new Set(questions.map((q) => q.theme).filter(Boolean)),
  ).sort();

  // Fetch questions
  useEffect(() => {
    fetchArchivedQuestions();
  }, []);

  // Apply filters whenever questions or filter values change
  useEffect(() => {
    applyFilters();
  }, [questions, searchTerm, typeFilter, themeFilter]);

  const fetchArchivedQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/trivia-questions?status=archived&limit=1000",
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch archived questions");
      }

      setQuestions(result.data || []);
    } catch (err) {
      console.error("Failed to fetch archived questions:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.question_text.toLowerCase().includes(search) ||
          q.correct_answer.toLowerCase().includes(search),
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((q) => q.question_type === typeFilter);
    }

    // Theme filter
    if (themeFilter !== "all") {
      filtered = filtered.filter((q) => q.theme === themeFilter);
    }

    setFilteredQuestions(filtered);
    if (
      filtered.length > 0 &&
      !filtered.find((q) => q.id === selectedQuestion?.id)
    ) {
      setSelectedQuestion(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setThemeFilter("all");
  };

  const handleRestore = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to restore this question? It will be moved to the review queue.",
      )
    )
      return;
    try {
      const response = await fetch(`/api/trivia-questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || "Failed to restore question");
      setQuestions(questions.filter((q) => q.id !== id));
      alert("Question restored to draft state.");
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to PERMANENTLY DELETE this question? This action cannot be undone.",
      )
    )
      return;
    try {
      const response = await fetch(`/api/trivia-questions/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || "Failed to delete question");
      setQuestions(questions.filter((q) => q.id !== id));
      alert("Question permanently deleted.");
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
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
          Archived Trivia Questions
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Review, restore, or permanently delete archived questions.
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions..."
                className="pl-10 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
        </div>

        {/* Active Filters Info & Clear */}
        {(searchTerm || typeFilter !== "all" || themeFilter !== "all") && (
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

      {/* Content Grid */}
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
                Archived Questions ({filteredQuestions.length})
              </h3>
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No archived questions found</p>
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
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {question.question_text}
                      </p>
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
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                      Question
                    </h4>
                    <p className="text-sm text-gray-900">
                      {selectedQuestion.question_text}
                    </p>
                  </div>
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
                </div>
                {/* Actions */}
                <div className="mt-6 border-t border-gray-200 pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => handleDelete(selectedQuestion.id)}
                    className="flex items-center gap-2 px-4 py-2 text-red-700 text-sm font-medium rounded-md hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete Permanently
                  </button>
                  <button
                    onClick={() => handleRestore(selectedQuestion.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                  >
                    <ArrowUturnLeftIcon className="h-4 w-4" />
                    Restore to Drafts
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-sm text-gray-500">
                  Select an archived question to review and take action.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
