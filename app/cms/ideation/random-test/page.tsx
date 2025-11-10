"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import type { MultipleChoiceTrivia } from "@/lib/multiple-choice-trivia-types";

export default function RandomTestPage() {
  const [questions, setQuestions] = useState<MultipleChoiceTrivia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/public/multiple-choice-trivia/random?count=10",
      );
      const result = await response.json();

      if (result.success) {
        // Handle both single object (backward compat) and array
        const questionsData = Array.isArray(result.data)
          ? result.data
          : [result.data];
        setQuestions(questionsData);
      } else {
        setError(result.error || "Failed to fetch questions");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch questions",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomQuestions();
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Heading level={1}>Random Trivia Test</Heading>
          <Button onClick={fetchRandomQuestions} variant="primary">
            Get New Random Questions
          </Button>
        </div>

        <p className="text-sm text-gray-600">
          Displaying 10 randomly selected multiple-choice trivia questions to
          test randomness.
        </p>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((question, index) => {
              const allAnswers = [
                question.correct_answer,
                ...question.wrong_answers,
              ];
              const shuffledAnswers = shuffleArray(allAnswers);

              return (
                <div
                  key={question.id}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {index + 1}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {question.theme && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {question.theme}
                        </span>
                      )}
                      {question.category && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          {question.category}
                        </span>
                      )}
                      {question.difficulty && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {question.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-base text-gray-800 mb-4">
                    {question.question_text}
                  </p>

                  <div className="space-y-2">
                    {shuffledAnswers.map((answer, answerIndex) => {
                      const isCorrect = answer === question.correct_answer;
                      const letter = String.fromCharCode(65 + answerIndex); // A, B, C, D

                      return (
                        <div
                          key={answerIndex}
                          className={`p-3 rounded border ${
                            isCorrect
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <span className="font-medium text-gray-700">
                            {letter}){" "}
                          </span>
                          <span className="text-gray-800">{answer}</span>
                          {isCorrect && (
                            <span className="ml-2 text-xs text-green-600 font-medium">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-900">
                        <span className="font-medium">Explanation: </span>
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    ID: {question.id}
                    {question.attribution && (
                      <span className="ml-4">
                        Attribution: {question.attribution}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && questions.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              No questions found. Make sure there are published questions in the
              database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
