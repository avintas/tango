"use client";

import { useState } from "react";

interface MultipleChoiceTriviaItem {
  id: number;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation?: string | null;
  category?: string | null;
  theme?: string | null;
  difficulty?: string | null;
  tags?: string[] | null;
  attribution?: string | null;
  status?: string | null;
  used_in?: string[] | null;
  created_at: string;
}

interface MultipleChoiceTriviaCardProps {
  item: MultipleChoiceTriviaItem;
  onStatusChange?: (id: number, newStatus: string | null) => void;
  onDelete?: (id: number) => void;
}

export default function MultipleChoiceTriviaCard({
  item,
  onStatusChange,
  onDelete,
}: MultipleChoiceTriviaCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const charCount = item.question_text.length;
  const wordCount = item.question_text.split(/\s+/).filter(Boolean).length;

  const getStatusBadge = (status?: string | null) => {
    if (status === "published") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Published
        </span>
      );
    }
    if (status === "archived") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          Archived
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
        Unpublished
      </span>
    );
  };

  const handleCopy = async () => {
    try {
      const allOptions = [item.correct_answer, ...item.wrong_answers];
      const optionsText = allOptions
        .map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`)
        .join("\n");
      const textToCopy = `${item.question_text}\n\n${optionsText}\n\nCorrect Answer: ${item.correct_answer}${item.explanation ? `\n\nExplanation: ${item.explanation}` : ""}`;
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleStatusChange = async (newStatus: string | null) => {
    if (!onStatusChange || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/multiple-choice-trivia/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      onStatusChange(item.id, newStatus || "");
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isProcessing) return;

    if (!confirm("Are you sure you want to delete this trivia question?")) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/multiple-choice-trivia/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      onDelete(item.id);
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentStatus = item.status;
  const isArchived = currentStatus === "archived";
  const isPublished = currentStatus === "published";

  const allOptions = [item.correct_answer, ...item.wrong_answers];

  return (
    <div className="p-4 rounded-lg bg-white border border-gray-300 hover:border-indigo-300 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📋</span>
        <div className="flex-1 min-w-0">
          {/* Status Badge */}
          <div className="mb-2">{getStatusBadge(currentStatus)}</div>

          {/* Question */}
          <p className="text-sm text-gray-900 mb-2 leading-relaxed font-medium">
            {item.question_text}
          </p>

          {/* Answer Options */}
          <div className="mb-2 space-y-1">
            {allOptions.map((option, index) => {
              const isCorrect = option === item.correct_answer;
              return (
                <div
                  key={index}
                  className={`text-sm p-2 rounded ${
                    isCorrect
                      ? "bg-green-100 text-green-900 font-semibold border-l-4 border-green-500"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="font-mono mr-2">
                    {String.fromCharCode(65 + index)})
                  </span>
                  {option}
                  {isCorrect && (
                    <span className="ml-2 text-green-700">✓ Correct</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation (if provided) */}
          {item.explanation && (
            <p className="text-xs text-gray-600 mb-2 italic bg-blue-50 p-2 rounded">
              💡 {item.explanation}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-500 mb-3">
            {item.theme && (
              <>
                <span className="text-blue-600 font-medium capitalize">
                  {item.theme}
                </span>
                <span>•</span>
              </>
            )}
            {item.category && (
              <>
                <span className="text-purple-600 capitalize">
                  {item.category}
                </span>
                <span>•</span>
              </>
            )}
            {item.difficulty && (
              <>
                <span className="text-orange-600 font-medium capitalize">
                  {item.difficulty}
                </span>
                <span>•</span>
              </>
            )}
            {item.used_in && item.used_in.length > 0 && (
              <>
                <span className="text-green-700 font-medium">
                  ✓ Used {item.used_in.length}x
                </span>
                <span>•</span>
              </>
            )}
            {item.tags && item.tags.length > 0 && (
              <>
                <span>
                  Tags: {item.tags.slice(0, 2).join(", ")}
                  {item.tags.length > 2 && "..."}
                </span>
                <span>•</span>
              </>
            )}
            {item.attribution && (
              <>
                <span>{item.attribution}</span>
                <span>•</span>
              </>
            )}
            <span>{charCount} chars</span>
            <span>•</span>
            <span>{wordCount} words</span>
            <span>•</span>
            <span>ID: {item.id}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              disabled={isProcessing}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCopied ? "✓ Copied!" : "📋 Copy"}
            </button>

            {/* Status Change Buttons */}
            {!isArchived && (
              <>
                {isPublished ? (
                  <button
                    onClick={() => handleStatusChange(null)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-md hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📥 Unpublish
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange("published")}
                    disabled={isProcessing}
                    className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-300 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📤 Publish
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange("archived")}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🗄️ Archive
                </button>
              </>
            )}

            {/* Restore button for archived items */}
            {isArchived && (
              <button
                onClick={() => handleStatusChange(null)}
                disabled={isProcessing}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Restore
              </button>
            )}

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isProcessing}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
