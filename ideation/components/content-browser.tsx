"use client";

import { useState, useEffect } from "react";
import type { SourceContentIngested } from "@/lib/supabase";
import type { ExplorationFilters } from "../lib/types";
import { UsageBadges } from "@/components/content-library/usage-badges";

interface ContentBrowserProps {
  filters?: ExplorationFilters;
  onContentSelect?: (content: SourceContentIngested) => void;
  selectedIds?: number[];
  multiSelect?: boolean;
}

/**
 * Content Browser Component
 * Displays source content with filtering and selection
 */
export function ContentBrowser({
  filters = {},
  onContentSelect,
  selectedIds = [],
  multiSelect = false,
}: ContentBrowserProps) {
  const [content, setContent] = useState<SourceContentIngested[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("action", "search");

        if (filters.themes && filters.themes.length > 0) {
          params.append("themes", filters.themes.join(","));
        }
        if (filters.categories && filters.categories.length > 0) {
          params.append("categories", filters.categories.join(","));
        }
        if (filters.tags && filters.tags.length > 0) {
          params.append("tags", filters.tags.join(","));
        }
        if (filters.hasUsage !== undefined) {
          params.append("hasUsage", filters.hasUsage.toString());
        }
        if (filters.usageTypes && filters.usageTypes.length > 0) {
          params.append("usageTypes", filters.usageTypes.join(","));
        }

        const response = await fetch(
          `/api/ideation/explore?${params.toString()}`,
        );
        const data = await response.json();

        if (data.success) {
          setContent(data.data);
        }
      } catch (error) {
        console.error("Failed to load content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [filters]);

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading content...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Source Content ({content.length})
        </h3>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {content.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => onContentSelect?.(item)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {item.title || `Content #${item.id}`}
                  </h4>
                  {item.summary && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {item.theme && (
                      <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                        {item.theme}
                      </span>
                    )}
                    {item.category && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {item.category}
                      </span>
                    )}
                    {item.used_for && item.used_for.length > 0 && (
                      <UsageBadges usedFor={item.used_for} />
                    )}
                  </div>
                </div>
                {isSelected && (
                  <span className="text-indigo-600 text-sm">✓</span>
                )}
              </div>
            </div>
          );
        })}
        {content.length === 0 && (
          <div className="p-4 text-sm text-gray-500 text-center">
            No content found matching filters
          </div>
        )}
      </div>
    </div>
  );
}
