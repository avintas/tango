"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IngestedContent } from "@/lib/supabase";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getBadgeConfig } from "@/config/content-badges";
import clsx from "clsx";

export default function ContentLibraryPage() {
  const router = useRouter();
  const [items, setItems] = useState<IngestedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<IngestedContent | null>(
    null,
  );
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

      const response = await fetch(`/api/content-source?${params.toString()}`);
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
                  const showEllipsisStart = currentPage > 3;
                  const showEllipsisEnd = currentPage < totalPages - 2;

                  // Always show first page
                  pages.push(
                    <button
                      key={1}
                      onClick={() => goToPage(1)}
                      className={clsx(
                        "w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                        currentPage === 1
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      1
                    </button>,
                  );

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
                    pages.push(
                      <button
                        key={2}
                        onClick={() => goToPage(2)}
                        className={clsx(
                          "w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                          currentPage === 2
                            ? "bg-indigo-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                        )}
                      >
                        2
                      </button>,
                    );
                  }

                  // Show middle pages
                  const startPage = Math.max(3, currentPage - 1);
                  const endPage = Math.min(totalPages - 2, currentPage + 1);

                  for (let i = startPage; i <= endPage; i++) {
                    if (i > 1 && i < totalPages) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={clsx(
                            "w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                            currentPage === i
                              ? "bg-indigo-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          {i}
                        </button>,
                      );
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
                  } else if (totalPages > 2 && totalPages - 1 > endPage) {
                    pages.push(
                      <button
                        key={totalPages - 1}
                        onClick={() => goToPage(totalPages - 1)}
                        className={clsx(
                          "w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                          currentPage === totalPages - 1
                            ? "bg-indigo-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                        )}
                      >
                        {totalPages - 1}
                      </button>,
                    );
                  }

                  // Always show last page if more than 1 page
                  if (totalPages > 1) {
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => goToPage(totalPages)}
                        className={clsx(
                          "w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                          currentPage === totalPages
                            ? "bg-indigo-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                        )}
                      >
                        {totalPages}
                      </button>,
                    );
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
                {items.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={clsx(
                      "p-4 cursor-pointer hover:bg-gray-50",
                      selectedItem?.id === item.id && "bg-indigo-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={clsx(
                          "font-semibold text-sm truncate flex-1",
                          selectedItem?.id === item.id
                            ? "text-indigo-800"
                            : "text-gray-900",
                        )}
                      >
                        {item.title || `Item #${item.id}`}
                      </h4>
                      {item.used_for && item.used_for.length > 0 && (
                        <div className="flex gap-1 flex-shrink-0">
                          {getBadgeConfig(item.used_for).map((badge) => (
                            <span
                              key={badge.key}
                              className={clsx(
                                "inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded",
                                badge.bgColor,
                                badge.textColor,
                              )}
                              title={badge.title}
                            >
                              {badge.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {item.id} • {item.word_count} words
                    </p>
                  </li>
                ))}
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
              <div>
                <h2 className="text-base font-bold mb-4">
                  {selectedItem.title}
                </h2>
                <p className="text-xs whitespace-pre-wrap leading-relaxed">
                  {selectedItem.content_text}
                </p>
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
