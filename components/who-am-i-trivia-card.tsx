"use client";

import { useState } from "react";

interface WhoAmITriviaItem {
  id: number;
  question_text: string;
  correct_answer: string;
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

interface WhoAmITriviaCardProps {
  item: WhoAmITriviaItem;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function WhoAmITriviaCard({
  item,
  onArchive,
  onDelete,
}: WhoAmITriviaCardProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get character and word count
  const charCount = item.question_text.length;
  const wordCount = item.question_text.split(/\s+/).filter(Boolean).length;

  // Get status badge styling
  const getStatusBadge = (status?: string | null) => {
    if (!status || status === "draft") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          Draft
        </span>
      );
    }
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
    return null;
  };

  const handleArchive = async () => {
    if (!onArchive) return;

    setIsArchiving(true);
    try {
      const response = await fetch(`/api/who-am-i-trivia/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!response.ok) throw new Error("Failed to archive");

      onArchive(item.id);
    } catch (error) {
      alert("Failed to archive Who Am I question");
      console.error(error);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!confirm("Are you sure you want to delete this Who Am I question?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/who-am-i-trivia/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      onDelete(item.id);
    } catch (error) {
      alert("Failed to delete Who Am I question");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white border border-gray-300">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🤔</span>
        <div className="flex-1">
          {/* Status Badge */}
          <div className="mb-2">{getStatusBadge(item.status)}</div>

          {/* Question */}
          <p className="text-gray-900 mb-3 font-medium">{item.question_text}</p>

          {/* Answer */}
          <div className="mb-3">
            <div className="text-sm p-3 rounded bg-purple-100 text-purple-900 font-semibold border-l-4 border-purple-500">
              <span className="text-purple-700 mr-2">✓ Answer:</span>
              {item.correct_answer}
            </div>
          </div>

          {/* Explanation (if provided) */}
          {item.explanation && (
            <p className="text-sm text-gray-600 mb-3 italic bg-blue-50 p-2 rounded">
              💡 {item.explanation}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
            {/* Type */}
            <span className="text-purple-600 font-medium">Who Am I</span>

            {/* ID */}
            <span>• ID: {item.id}</span>

            {/* Theme */}
            {item.theme && (
              <span className="text-blue-600 font-medium">• {item.theme}</span>
            )}

            {/* Category */}
            {item.category && (
              <span className="text-purple-600">• {item.category}</span>
            )}

            {/* Difficulty */}
            {item.difficulty && (
              <span className="text-orange-600 font-medium">
                • {item.difficulty}
              </span>
            )}

            {/* Character Count */}
            <span>• {charCount} chars</span>

            {/* Word Count */}
            <span>• {wordCount} words</span>

            {/* Used In Count */}
            {item.used_in && item.used_in.length > 0 && (
              <span className="text-green-700 font-medium">
                • ✓ Used {item.used_in.length} time
                {item.used_in.length !== 1 ? "s" : ""}
              </span>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <span className="text-gray-500">
                • Tags: {item.tags.slice(0, 3).join(", ")}
                {item.tags.length > 3 && "..."}
              </span>
            )}

            {/* Attribution */}
            {item.attribution && (
              <span className="text-gray-700">• {item.attribution}</span>
            )}

            {/* Action Buttons */}
            {(onArchive || onDelete) && (
              <div className="ml-auto flex items-center gap-2">
                {onArchive && item.status !== "archived" && (
                  <button
                    onClick={handleArchive}
                    disabled={isArchiving}
                    className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    title="Archive"
                  >
                    {isArchiving ? "..." : "🗄️"}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    title="Delete"
                  >
                    {isDeleting ? "..." : "🗑️"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
