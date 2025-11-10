"use client";

import { useState, useEffect } from "react";

interface ThemeExplorerProps {
  onThemeSelect?: (theme: string) => void;
  selectedTheme?: string;
}

/**
 * Theme Explorer Component
 * Displays available themes with content counts
 */
export function ThemeExplorer({
  onThemeSelect,
  selectedTheme,
}: ThemeExplorerProps) {
  const [themes, setThemes] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemes = async () => {
      setIsLoading(true);
      try {
        const [themesResponse, countsResponse] = await Promise.all([
          fetch("/api/ideation/explore?action=themes"),
          fetch("/api/ideation/explore?action=content-counts"),
        ]);

        const themesData = await themesResponse.json();
        const countsData = await countsResponse.json();

        if (themesData.success) {
          setThemes(themesData.data);
        }
        if (countsData.success) {
          setCounts(countsData.data);
        }
      } catch (error) {
        console.error("Failed to load themes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemes();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading themes...</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900">Themes</h3>
      <div className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => onThemeSelect?.(theme)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedTheme === theme
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {theme}
            {counts[theme] !== undefined && (
              <span className="ml-1.5 text-gray-500">({counts[theme]})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
