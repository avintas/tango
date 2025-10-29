"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Prompt } from "@/lib/supabase";
import { Heading } from "@/components/ui/heading";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export default function PromptsLibraryPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  // Fetch prompts from API
  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * limit;
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });

      const response = await fetch(`/api/prompts?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch prompts");
      }

      setPrompts(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error("Failed to fetch prompts:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit]);

  // Initial load and refetch on page change
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle use prompt
  const handleUsePrompt = () => {
    if (!selectedPrompt) return;

    // Store prompt and type in sessionStorage
    sessionStorage.setItem("aiPrompt", selectedPrompt.prompt_content);
    if (selectedPrompt.content_type) {
      sessionStorage.setItem("contentType", selectedPrompt.content_type);
    }

    // Check for return path (set by the page that sent us here)
    const returnPath = sessionStorage.getItem("libraryReturnPath");

    if (returnPath) {
      // Return to the page that sent us here (e.g., Main Generator)
      router.push(returnPath);
    } else {
      // Fallback: Navigate to main generator
      router.push("/cms/processing/main-generator");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <Heading>Prompts Library</Heading>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-6 px-6 pb-6 h-full">
        {/* Left Column: Prompt List */}
        <div className="md:col-span-2 flex flex-col h-full">
          <div className="bg-white p-4 rounded-t-lg border-x border-t border-gray-200 shadow-sm space-y-3">
            <div className="text-xs text-gray-600">
              {isLoading
                ? "Loading..."
                : `${total} total prompts • Page ${currentPage} of ${totalPages}`}
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
            ) : prompts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {prompts.map((prompt) => (
                  <li
                    key={prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={clsx(
                      "p-4 cursor-pointer hover:bg-gray-50",
                      selectedPrompt?.id === prompt.id && "bg-indigo-50",
                    )}
                  >
                    <h4
                      className={clsx(
                        "font-semibold text-sm truncate",
                        selectedPrompt?.id === prompt.id
                          ? "text-indigo-800"
                          : "text-gray-900",
                      )}
                    >
                      {prompt.prompt_name || `Prompt #${prompt.id}`}
                    </h4>
                    {prompt.content_type && (
                      <p className="text-xs text-gray-500 mt-1">
                        Type: {prompt.content_type}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No prompts found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Prompt Viewer */}
        <div className="md:col-span-3 flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Prompt Viewer
            </h3>
            <Button
              onClick={handleUsePrompt}
              disabled={!selectedPrompt}
              variant="primary"
            >
              Use Prompt
            </Button>
          </div>
          <div className="flex-grow p-6 overflow-y-auto">
            {selectedPrompt ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    {selectedPrompt.prompt_name}
                  </h2>
                  {selectedPrompt.content_type && (
                    <p className="text-sm text-gray-600 mb-4">
                      Content Type:{" "}
                      <span className="font-medium">
                        {selectedPrompt.content_type}
                      </span>
                    </p>
                  )}
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                    {selectedPrompt.prompt_content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 h-full flex items-center justify-center">
                <p>Select a prompt from the list to view its content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
