"use client";

import { useState } from "react";

interface MotivationalItem {
  id: number;
  quote: string;
  context?: string | null;
  theme?: string | null;
  category?: string | null;
  attribution?: string | null;
  status?: string | null;
  used_in?: string[] | null;
  created_at: string;
}

interface MotivationalCardProps {
  item: MotivationalItem;
  onStatusChange?: (id: number, newStatus: string) => void;
  onDelete?: (id: number) => void;
}

export default function MotivationalCard({
  item,
  onStatusChange,
  onDelete,
}: MotivationalCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Get character and word count
  const charCount = item.quote.length;
  const wordCount = item.quote.split(/\s+/).filter(Boolean).length;

  // Get status badge styling
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
    // Default to unpublished (for NULL or anything else)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
        Unpublished
      </span>
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.quote);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  const handleStatusChange = async (newStatus: string | null) => {
    if (!onStatusChange) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/motivational/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      onStatusChange(item.id, newStatus || "");
    } catch (error) {
      alert(`Failed to update status`);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (
      !confirm(
        "Are you sure you want to permanently delete this motivational quote?",
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/motivational/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      onDelete(item.id);
    } catch (error) {
      alert("Failed to delete motivational quote");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentStatus = item.status;
  const isArchived = currentStatus === "archived";
  const isPublished = currentStatus === "published";
  const isUnpublished = !isPublished && !isArchived;

  return (
    <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2">
        <span className="text-lg">💪</span>
        <div className="flex-1 min-w-0">
          {/* Status Badge */}
          <div className="mb-1">{getStatusBadge(item.status)}</div>

          {/* Quote - Small font */}
          <p className="text-sm text-gray-900 mb-1 leading-relaxed font-medium">
            &quot;{item.quote}&quot;
          </p>

          {/* Context (if provided) */}
          {item.context && (
            <p className="text-xs text-gray-600 mb-2 italic leading-relaxed">
              {item.context}
            </p>
          )}

          {/* Metadata Row - Extra small font */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-500 mb-2">
            <span className="font-medium">ID: {item.id}</span>

            {item.theme && (
              <>
                <span>•</span>
                <span className="text-blue-600 font-medium">{item.theme}</span>
              </>
            )}

            <span>•</span>
            <span>{charCount} chars</span>
            <span>•</span>
            <span>{wordCount} words</span>

            {item.used_in && item.used_in.length > 0 && (
              <>
                <span>•</span>
                <span className="text-green-600 font-medium">
                  ✓ Used {item.used_in.length}x
                </span>
              </>
            )}

            {item.attribution && (
              <>
                <span>•</span>
                <span className="text-gray-600">{item.attribution}</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              disabled={isProcessing}
              className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
              title="Copy to clipboard"
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
                    className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 rounded hover:bg-yellow-100 disabled:opacity-50 transition-colors"
                    title="Unpublish"
                  >
                    📥 Unpublish
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange("published")}
                    disabled={isProcessing}
                    className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 disabled:opacity-50 transition-colors"
                    title="Publish"
                  >
                    📤 Publish
                  </button>
                )}

                <button
                  onClick={() => handleStatusChange("archived")}
                  disabled={isProcessing}
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  title="Archive"
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
                className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors"
                title="Restore"
              >
                🔄 Restore
              </button>
            )}

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isProcessing}
              className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50 transition-colors"
              title="Delete permanently"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
