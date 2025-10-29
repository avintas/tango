"use client";

import { IngestedContent } from "@/lib/supabase";

interface ContentCardProps {
  item: IngestedContent;
  onUseAsSource?: () => void;
}

export function ContentCard({ item, onUseAsSource }: ContentCardProps) {
  const handleUseAsSource = () => {
    onUseAsSource?.();
  };

  // Get preview text
  const getPreview = () => {
    if (item.content_text) {
      return (
        item.content_text.slice(0, 150) +
        (item.content_text.length > 150 ? "..." : "")
      );
    }
    return "No content available";
  };

  return (
    <div className="space-y-2">
      {/* Row 1: Content Preview + Button */}
      <div className="flex items-start justify-between gap-3">
        <p className="flex-1 text-xs text-gray-700 line-clamp-2">
          {getPreview()}
        </p>
        <button
          onClick={handleUseAsSource}
          className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-500 transition-colors whitespace-nowrap"
        >
          Use as Source
        </button>
      </div>

      {/* Row 2: Metadata + Usage Badges */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">ID: {item.id}</span>
        {item.word_count && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{item.word_count} words</span>
          </>
        )}

        {/* Usage Badges */}
        {item.used_for && item.used_for.length > 0 && (
          <>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1">
              {item.used_for.includes("multiple-choice") && (
                <span
                  className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded"
                  title="Multiple Choice"
                >
                  MC
                </span>
              )}
              {item.used_for.includes("true-false") && (
                <span
                  className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded"
                  title="True/False"
                >
                  TF
                </span>
              )}
              {item.used_for.includes("who-am-i") && (
                <span
                  className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded"
                  title="Who Am I"
                >
                  WAI
                </span>
              )}
              {item.used_for.includes("statistic") && (
                <span
                  className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded"
                  title="Statistics"
                >
                  S
                </span>
              )}
              {item.used_for.includes("motivational") && (
                <span
                  className="px-1.5 py-0.5 text-xs font-medium bg-pink-100 text-pink-700 rounded"
                  title="Motivational"
                >
                  M
                </span>
              )}
              {item.used_for.includes("greeting") && (
                <span
                  className="px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded"
                  title="Greetings"
                >
                  G
                </span>
              )}
              {item.used_for.includes("wisdom") && (
                <span
                  className="px-1.5 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 rounded"
                  title="Wisdom (PBP)"
                >
                  W
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
