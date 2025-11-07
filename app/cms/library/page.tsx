"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SourceContentIngested } from "@/lib/supabase";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UsageBadges } from "@/components/content-library/usage-badges";
import clsx from "clsx";

export default function ContentLibraryPage() {
  const router = useRouter();
  const [items, setItems] = useState<SourceContentIngested[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<SourceContentIngested | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const limit = 12; // Items per page
  const totalPages = Math.ceil(total / limit);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * limit;
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(
        `/api/source-content-ingested?${params.toString()}`,
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch content");
      }

      setItems(result.data || []);
      setTotal(result.count || 0);

      // Automatically select the first item if the list is not empty and no item is selected
      if (result.data && result.data.length > 0 && !selectedItem) {
        setSelectedItem(result.data[0]);
      } else if (result.data && result.data.length === 0) {
        setSelectedItem(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, selectedItem]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleUseAsSource = () => {
    if (!selectedItem) return;

    sessionStorage.setItem("sourceContent", selectedItem.content_text);
    sessionStorage.setItem("sourceContentId", selectedItem.id.toString());
    const returnPath =
      sessionStorage.getItem("libraryReturnPath") ||
      "/cms/processing/main-generator";
    router.push(returnPath);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedItem(null); // Deselect item when changing page
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <Heading>Content Library</Heading>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-6 px-6 pb-6 h-full">
        {/* Left Column: Item List */}
        <div className="md:col-span-2 flex flex-col h-full">
          <div className="bg-white p-4 rounded-t-lg border-x border-t border-gray-200 shadow-sm space-y-3">
            <Input
              type="search"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <div className="text-xs text-gray-600">
              {isLoading
                ? "Loading..."
                : `${total} total items • Page ${currentPage} of ${totalPages}`}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={clsx(
                    "w-8 h-8 flex items-center justify-center rounded-md border text-sm font-medium transition-colors",
                    currentPage === 1
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50",
                  )}
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {/* Page Numbers */}
                {(() => {
                  const pages = [];
                  const addedPages = new Set<number>(); // Track which page numbers we've added

                  const addPage = (pageNum: number) => {
                    if (
                      !addedPages.has(pageNum) &&
                      pageNum >= 1 &&
                      pageNum <= totalPages
                    ) {
                      addedPages.add(pageNum);
                      pages.push(
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={clsx(
                            "w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          {pageNum}
                        </button>,
                      );
                    }
                  };

                  const showEllipsisStart = currentPage > 3;
                  const showEllipsisEnd = currentPage < totalPages - 2;

                  // Always show first page
                  addPage(1);

                  // Show ellipsis or page 2
                  if (showEllipsisStart) {
                    pages.push(
                      <span
                        key="ellipsis-start"
                        className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs"
                      >
                        ...
                      </span>,
                    );
                  } else if (totalPages > 1) {
                    addPage(2);
                  }

                  // Show middle pages
                  const startPage = Math.max(3, currentPage - 1);
                  const endPage = Math.min(totalPages - 2, currentPage + 1);

                  for (let i = startPage; i <= endPage; i++) {
                    if (i > 1 && i < totalPages) {
                      addPage(i);
                    }
                  }

                  // Show ellipsis or second-to-last page
                  if (showEllipsisEnd) {
                    pages.push(
                      <span
                        key="ellipsis-end"
                        className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs"
                      >
                        ...
                      </span>,
                    );
                  } else if (totalPages > 2) {
                    addPage(totalPages - 1);
                  }

                  // Always show last page if more than 1 page
                  if (totalPages > 1) {
                    addPage(totalPages);
                  }

                  return pages;
                })()}

                {/* Next Button */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={clsx(
                    "w-8 h-8 flex items-center justify-center rounded-md border text-sm font-medium transition-colors",
                    currentPage === totalPages
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50",
                  )}
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            )}
          </div>
          <div className="flex-grow bg-white border-x border-b border-gray-200 shadow-sm overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="p-6">
                <Alert type="error" message={error} />
              </div>
            ) : items.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {items.map((item) => {
                  // Use AI-generated title or fallback
                  const displayTitle =
                    item.title ||
                    item.summary?.slice(0, 60) ||
                    item.content_text.split("\n")[0].slice(0, 60) + "...";

                  return (
                    <li
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={clsx(
                        "p-4 cursor-pointer hover:bg-gray-50",
                        selectedItem?.id === item.id && "bg-indigo-50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4
                            className={clsx(
                              "font-semibold text-sm truncate",
                              selectedItem?.id === item.id
                                ? "text-indigo-800"
                                : "text-gray-900",
                            )}
                          >
                            {displayTitle}
                          </h4>
                          {/* Summary Preview */}
                          {item.summary ? (
                            <p
                              className="text-xs text-gray-600 mt-1 line-clamp-2"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.summary}
                            </p>
                          ) : (
                            <p
                              className="text-xs text-gray-600 mt-1 line-clamp-2"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.content_text}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <p className="text-xs text-gray-500">
                              ID: {item.id} • {item.word_count || 0} words
                            </p>
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
                            {/* Usage Badges */}
                            {item.used_for && item.used_for.length > 0 && (
                              <>
                                <span className="text-gray-400">•</span>
                                <UsageBadges usedFor={item.used_for} />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No content found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Content Viewer */}
        <div className="md:col-span-3 flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Content Viewer
            </h3>
            <Button
              onClick={handleUseAsSource}
              disabled={!selectedItem}
              variant="primary"
            >
              Use as Source
            </Button>
          </div>
          <div className="flex-grow p-6 overflow-y-auto">
            {selectedItem ? (
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    {selectedItem.title || `Item #${selectedItem.id}`}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedItem.theme && (
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                        Theme: {selectedItem.theme}
                      </span>
                    )}
                    {selectedItem.category && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        Category: {selectedItem.category}
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      Status: {selectedItem.ingestion_status}
                    </span>
                  </div>

                  {/* Usage Badges */}
                  {selectedItem.used_for &&
                    selectedItem.used_for.length > 0 && (
                      <div className="mt-3">
                        <h3 className="text-xs font-semibold text-gray-700 mb-2">
                          Used For
                        </h3>
                        <UsageBadges usedFor={selectedItem.used_for} />
                      </div>
                    )}
                </div>

                {/* Summary */}
                {selectedItem.summary && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Summary
                    </h3>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {selectedItem.summary}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Phrases */}
                {selectedItem.key_phrases &&
                  selectedItem.key_phrases.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Key Phrases
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.key_phrases.map((phrase, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded"
                          >
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Content */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Content
                  </h3>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-900">
                    {selectedItem.content_text}
                  </p>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Word Count:</span>{" "}
                      {selectedItem.word_count || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Character Count:</span>{" "}
                      {selectedItem.char_count || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(selectedItem.created_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>{" "}
                      {new Date(selectedItem.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 h-full flex items-center justify-center">
                <p className="text-sm">
                  Select an item from the list to view its content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
