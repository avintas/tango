"use client";

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
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

export default function TriviaReviewQueue() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDraftQuestions();
  }, []);

  const fetchDraftQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/trivia-questions?status=draft&limit=100",
      );
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch draft questions");
      }
      setQuestions(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    await updateQuestionStatus(id, "published");
  };

  const handleArchive = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to archive this question? It will be removed from this list but not permanently deleted.",
      )
    ) {
      await updateQuestionStatus(id, "archived");
    }
  };

  const updateQuestionStatus = async (
    id: number,
    status: "published" | "draft" | "archived",
  ) => {
    try {
      const response = await fetch(`/api/trivia-questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update status");
      }
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err) {
      alert(
        `Error updating status: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        Trivia Questions Ready for Review ({questions.length})
      </h2>
      {questions.length === 0 ? (
        <p className="text-gray-500">No draft questions to review.</p>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-gray-200 rounded-lg p-2 transition-shadow hover:shadow-md"
            >
              <p className="text-sm font-medium text-gray-800 mb-2">
                {q.question_text}
              </p>

              <div className="text-xs space-y-1 mb-2">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-green-700">
                    ✓ Correct:
                  </span>
                  <span className="text-gray-800">{q.correct_answer}</span>
                </div>
                {q.wrong_answers.map((ans, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-semibold text-red-700">✗ Wrong:</span>
                    <span className="text-gray-800">{ans}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                  <span className="font-normal bg-gray-100 px-2 py-1 rounded-full">
                    {q.theme || "No Theme"}
                  </span>
                  {q.tags?.map((t) => (
                    <span
                      key={t}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleArchive(q.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                    title="Archive"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => handleApprove(q.id)}
                    className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100"
                    title="Approve"
                  >
                    <CheckCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
