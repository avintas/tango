"use client";

import { useState, useEffect } from "react";

interface PbpItem {
  id: number;
  reflection_text: string;
  theme?: string;
  created_at: string;
}

export default function PbpLibraryPage() {
  const [items, setItems] = useState<PbpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PbpItem | null>(null);

  useEffect(() => {
    fetchPbpContent();
  }, []);

  const fetchPbpContent = async () => {
    try {
      const response = await fetch("/api/penalty-box-philosopher");
      const result = await response.json();

      if (result.success) {
        setItems(result.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch Penalty Box Philosopher content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🧘 Penalty Box Philosopher Library
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse philosophical reflections from the penalty box - thoughtful
            observations on hockey, life, and deeper truths
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* List */}
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">
                    No Penalty Box Philosopher content found.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Generate some content from The Main Generator page.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                      selectedItem?.id === item.id
                        ? "border-purple-500 ring-2 ring-purple-200"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">🧘</span>
                      {item.theme && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 capitalize">
                          {item.theme}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 font-medium line-clamp-3">
                      {item.reflection_text}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Detail Panel */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              {selectedItem ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Reflection Detail
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Reflection
                      </label>
                      <p className="mt-1 text-sm text-gray-900 leading-relaxed">
                        {selectedItem.reflection_text}
                      </p>
                    </div>

                    {selectedItem.theme && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Theme
                        </label>
                        <span className="mt-1 inline-block px-3 py-1 text-sm font-medium rounded bg-purple-100 text-purple-800 capitalize">
                          {selectedItem.theme}
                        </span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-xs">
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Date(
                            selectedItem.created_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">
                    Select a reflection to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
