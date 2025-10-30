"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusCircleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { TriviaQuestion } from "@/lib/supabase";

interface QuestionBankProps {
  onSelectQuestion: (question: TriviaQuestion) => void;
  typeFilter: "multiple-choice" | "true-false" | "who-am-i" | "all";
  themeFilter: string | null;
}

export default function QuestionBank({
  onSelectQuestion,
  typeFilter,
  themeFilter,
}: QuestionBankProps) {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<TriviaQuestion[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPublishedQuestions();
  }, [typeFilter, themeFilter]);

  useEffect(() => {
    applyFilters();
  }, [questions, searchTerm]);

  const fetchPublishedQuestions = async () => {
    setIsLoading(true);
    let url = "/api/trivia-questions?status=published&limit=1000";
    if (typeFilter !== "all") {
      url += `&question_type=${typeFilter}`;
    }
    if (themeFilter) {
      url += `&theme=${encodeURIComponent(themeFilter)}`;
    }

    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setQuestions(result.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];
    if (searchTerm.trim()) {
      filtered = filtered.filter((q) =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredQuestions(filtered);
  };

  const handleArchiveQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/trivia-questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove the question from the local state immediately
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      } else {
        console.error("Failed to archive question:", result.error);
      }
    } catch (error) {
      console.error("Error archiving question:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search within selected questions..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Question List */}
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-2">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="p-2 border rounded-md flex items-center justify-between"
            >
              <span className="text-xs text-gray-800 flex-1">
                {q.question_text}
              </span>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <button
                  onClick={() => onSelectQuestion(q)}
                  title="Add Question"
                  className="flex-shrink-0"
                >
                  <PlusCircleIcon className="h-6 w-6 text-indigo-600 hover:text-indigo-800" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchiveQuestion(q.id);
                  }}
                  title="Archive Question"
                  className="flex-shrink-0"
                >
                  <ArchiveBoxIcon className="h-6 w-6 text-orange-500 hover:text-orange-700" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
