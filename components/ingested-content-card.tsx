"use client";

import { useState } from "react";
import clsx from "clsx";
import { getBadgeConfig } from "@/config/content-badges";

interface IngestedContentItem {
  id: number;
  content_text: string;
  word_count?: number;
  char_count?: number;
  used_for?: string[];
  themes?: string;
  title?: string;
  status?: string | null;
  created_at?: string;
}

interface IngestedContentCardProps {
  item: IngestedContentItem;
  onStatusChange?: (id: number, newStatus: string | null) => void;
  onDelete?: (id: number) => void;
}

export default function IngestedContentCard({
  item,
  onStatusChange,
  onDelete,
}: IngestedContentCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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
      await navigator.clipboard.writeText(item.content_text);
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
      const response = await fetch(`/api/content-source/${item.id}`, {
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

    if (
      !confirm(
        "Are you sure you want to delete this ingested content? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/content-source/${item.id}`, {
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

  return (
    <div className="p-4 rounded-lg bg-white border border-gray-300 hover:border-indigo-300 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📄</span>
        <div className="flex-1 min-w-0">
          {/* Status Badge */}
          <div className="mb-2">{getStatusBadge(currentStatus)}</div>

          {/* Title (if exists) */}
          {item.title && (
            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
              {item.title}
            </h3>
          )}

          {/* Content Preview - First 4 lines using CSS line-clamp */}
          <div className="text-sm text-gray-900 mb-2 leading-relaxed">
            <p
              className="line-clamp-4"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.content_text}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-500 mb-3">
            {item.themes && (
              <>
                <span className="text-purple-600 font-medium capitalize">
                  {item.themes}
                </span>
                <span>•</span>
              </>
            )}
            {item.used_for && item.used_for.length > 0 && (
              <>
                <div className="flex gap-1">
                  {getBadgeConfig(item.used_for).map((badge) => (
                    <span
                      key={badge.key}
                      className={clsx(
                        "inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold rounded",
                        badge.bgColor,
                        badge.textColor,
                      )}
                      title={badge.title}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
                <span>•</span>
              </>
            )}
            {item.word_count && (
              <>
                <span>{item.word_count} words</span>
                <span>•</span>
              </>
            )}
            {item.char_count && (
              <>
                <span>{item.char_count} chars</span>
                <span>•</span>
              </>
            )}
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
