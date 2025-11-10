"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface TriviaSetTrueFalse {
  id: number;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  theme?: string;
  difficulty?: string;
  tags: string[];
  question_count: number;
  question_data: Array<{
    question_text: string;
    question_type: string;
    correct_answer: string; // "True" or "False"
    wrong_answers: string[]; // Empty array for true/false
    explanation?: string;
    source_id?: number;
    difficulty?: number;
    points?: number;
  }>;
  status: string;
  visibility: string;
  created_at: string;
}

export default function TriviaSetTrueFalseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params?.id ? parseInt(params.id as string) : null;

  const [set, setSet] = useState<TriviaSetTrueFalse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!setId) {
      setError("Invalid set ID");
      setLoading(false);
      return;
    }

    const fetchSet = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/trivia-sets/true-false/${setId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setSet(result.data);
        } else {
          setError(result.error || "Failed to load trivia set");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load trivia set",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSet();
  }, [setId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !set) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert type="error" message={error || "Trivia set not found"} />
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/cms/trivia-sets-true-false-library")}
            >
              ← Back to Library
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level={1}>{set.title}</Heading>
            {set.description && (
              <p className="mt-2 text-gray-600">{set.description}</p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/cms/trivia-sets-true-false-library")}
          >
            ← Back to Library
          </Button>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Questions:</span>
              <span className="ml-2 font-medium text-gray-900">
                {set.question_count}
              </span>
            </div>
            {set.category && (
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {set.category}
                </span>
              </div>
            )}
            {set.theme && (
              <div>
                <span className="text-gray-500">Theme:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {set.theme}
                </span>
              </div>
            )}
            {set.difficulty && (
              <div>
                <span className="text-gray-500">Difficulty:</span>
                <span
                  className={`ml-2 font-medium px-2 py-0.5 rounded ${
                    set.difficulty === "easy"
                      ? "bg-green-100 text-green-800"
                      : set.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {set.difficulty}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <Heading level={2}>Questions</Heading>
          {set.question_data && set.question_data.length > 0 ? (
            set.question_data.map((question, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Question {index + 1}
                  </h3>
                  {question.points && (
                    <span className="text-sm text-gray-500">
                      {question.points} points
                    </span>
                  )}
                </div>

                <p className="text-base text-gray-900 mb-4">
                  {question.question_text}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full font-semibold text-sm ${
                        question.correct_answer === "True"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {question.correct_answer === "True" ? "✓" : "✗"}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        question.correct_answer === "True"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {question.correct_answer}
                    </span>
                    <span className="text-xs text-gray-500">
                      (Correct Answer)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full font-semibold text-sm ${
                        question.correct_answer === "False"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {question.correct_answer === "False" ? "✓" : "✗"}
                    </span>
                    <span className="text-sm text-gray-700">
                      {question.correct_answer === "True" ? "False" : "True"}
                    </span>
                    <span className="text-xs text-gray-500">(Incorrect)</span>
                  </div>
                </div>

                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Explanation:
                    </p>
                    <p className="text-sm text-blue-800">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No questions found in this set.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
