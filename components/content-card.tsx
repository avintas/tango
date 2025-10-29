"use client";

import { useState } from "react";

interface ContentItem {
  id: number;
  content_text: string;
  content_type: string;
  content_title?: string | null;
  musings?: string | null;
  from_the_box?: string | null;
  theme?: string;
  attribution?: string;
  category?: string;
  status?: string;
}

interface ContentCardProps {
  item: ContentItem;
  index?: number;
  showNumber?: boolean;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
  onUpdate?: () => void;
}

export default function ContentCard({
  item,
  index,
  showNumber = false,
  onArchive,
  onDelete,
  onUpdate,
}: ContentCardProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get display text based on content type
  const getDisplayText = (item: ContentItem): React.ReactNode => {
    if (item.content_type === "wisdom") {
      // For wisdom, show musings and from_the_box separately if available
      if (item.musings || item.from_the_box) {
        return (
          <div className="space-y-2">
            {item.musings && (
              <p className="text-gray-900 italic">&quot;{item.musings}&quot;</p>
            )}
            {item.from_the_box && (
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">From the box:</span>{" "}
                {item.from_the_box}
              </p>
            )}
          </div>
        );
      }

      // Fallback: parse legacy content_text
      const match = item.content_text.match(/(.+?)\s*from the box:\s*(.+)/is);
      if (match) {
        return (
          <div className="space-y-2">
            <p className="text-gray-900 italic">
              &quot;{match[1].trim()}&quot;
            </p>
            <p className="text-gray-700 text-sm">
              <span className="font-semibold">From the box:</span>{" "}
              {match[2].trim()}
            </p>
          </div>
        );
      }
    }

    // For all other types, show content_text
    return <p className="text-gray-900">{item.content_text}</p>;
  };

  const getContentTypeEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      motivational: "🔥",
      statistic: "📊",
      wisdom: "💎",
      greeting: "👋",
      trivia: "🏒",
    };
    return emojiMap[type] || "📝";
  };

  const handleArchive = async () => {
    if (!onArchive) return;

    setIsArchiving(true);
    try {
      const response = await fetch(`/api/uni-content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!response.ok) throw new Error("Failed to archive");

      onArchive(item.id);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert("Failed to archive item");
      console.error(error);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/uni-content/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      onDelete(item.id);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert("Failed to delete item");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white border border-gray-300">
      <div className="flex items-start gap-3">
        <span className="text-2xl">
          {getContentTypeEmoji(item.content_type)}
        </span>
        <div className="flex-1">
          {item.content_title && (
            <h3 className="text-sm font-semibold text-indigo-600 mb-1">
              {item.content_title}
            </h3>
          )}
          {getDisplayText(item)}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {showNumber && typeof index === "number" && (
              <span className="text-xs text-gray-700">#{index + 1}</span>
            )}
            <span className="text-xs text-indigo-600 capitalize">
              {item.content_type}
            </span>
            {item.theme && (
              <span className="text-xs text-gray-700">• {item.theme}</span>
            )}
            {item.category && (
              <span className="text-xs text-gray-700">• {item.category}</span>
            )}
            <span className="text-xs text-gray-700">ID: {item.id}</span>

            {/* Archive/Delete buttons */}
            {(onArchive || onDelete) && (
              <div className="ml-auto flex items-center gap-2">
                {onArchive && (
                  <button
                    onClick={handleArchive}
                    disabled={isArchiving}
                    className="text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    title="Archive"
                  >
                    {isArchiving ? "..." : "🗄️"}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-xs text-red-600 hover:text-red-900 disabled:opacity-50"
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
