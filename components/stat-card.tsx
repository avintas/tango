"use client";

import { useState } from "react";

interface StatItem {
  id: number;
  stat_text: string;
  stat_value?: string | null;
  stat_category?: string | null;
  year?: number | null;
  theme?: string | null;
  category?: string | null;
  attribution?: string | null;
  status?: string | null;
  used_in?: string[] | null;
  created_at: string;
}

interface StatCardProps {
  item: StatItem;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function StatCard({ item, onArchive, onDelete }: StatCardProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get character and word count
  const charCount = item.stat_text.length;
  const wordCount = item.stat_text.split(/\s+/).filter(Boolean).length;

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
      const response = await fetch(`/api/stats/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!response.ok) throw new Error("Failed to archive");

      onArchive(item.id);
    } catch (error) {
      alert("Failed to archive stat");
      console.error(error);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!confirm("Are you sure you want to delete this stat?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/stats/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      onDelete(item.id);
    } catch (error) {
      alert("Failed to delete stat");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white border border-gray-300">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📊</span>
        <div className="flex-1">
          {/* Status Badge */}
          <div className="mb-2">{getStatusBadge(item.status)}</div>

          {/* Stat Text */}
          <p className="text-gray-900 mb-3">{item.stat_text}</p>

          {/* Stat Value */}
          {item.stat_value && (
            <p className="text-lg font-semibold text-indigo-700 mb-2">
              {item.stat_value}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
            {/* Type */}
            <span className="text-indigo-600 font-medium">Statistic</span>

            {/* ID */}
            <span>• ID: {item.id}</span>

            {/* Character Count */}
            <span>• {charCount} chars</span>

            {/* Word Count */}
            <span>• {wordCount} words</span>

            {/* Stat Category */}
            {item.stat_category && (
              <span className="text-blue-600 font-medium">
                • {item.stat_category}
              </span>
            )}

            {/* Year */}
            {item.year && (
              <span className="text-purple-600 font-medium">• {item.year}</span>
            )}

            {/* Theme */}
            {item.theme && <span>• Theme: {item.theme}</span>}

            {/* Category */}
            {item.category && <span>• {item.category}</span>}

            {/* Used In Count */}
            {item.used_in && item.used_in.length > 0 && (
              <span className="text-green-700 font-medium">
                • ✓ Used {item.used_in.length} time
                {item.used_in.length !== 1 ? "s" : ""}
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
