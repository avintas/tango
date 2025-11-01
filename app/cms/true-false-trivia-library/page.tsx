"use client";

import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { TrueFalseTrivia } from "@/lib/true-false-trivia-types";
import TrueFalseTriviaCard from "@/components/true-false-trivia-card";

type StatusFilter = "unpublished" | "published" | "archived";

export default function TrueFalseTriviaLibraryPage() {
  const [items, setItems] = useState<TrueFalseTrivia[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("unpublished");
  const [stats, setStats] = useState({
    unpublished: 0,
    published: 0,
    archived: 0,
  });

  const limit = 5;
  const totalPages = Math.ceil(total / limit);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/true-false-trivia?stats=true`);
      const result = await response.json();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * limit;
      const response = await fetch(
        `/api/true-false-trivia?status=${statusFilter}&limit=${limit}&offset=${offset}`,
      );
      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
        setTotal(result.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch true/false trivia:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handleStatusChange = async (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    await fetchStats();
  };

  const handleDelete = async (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    await fetchStats();
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getStatusLabel = (filter: StatusFilter) => {
    switch (filter) {
      case "unpublished":
        return "Unpublished";
      case "published":
        return "Published";
      case "archived":
        return "Archived";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ⚖️ True/False Trivia Library
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <span>
              Total:{" "}
              <span className="font-semibold">
                {stats.unpublished + stats.published + stats.archived}
              </span>
            </span>
            <span>•</span>
            <span>
              Unpublished:{" "}
              <span className="font-semibold">{stats.unpublished}</span>
            </span>
            <span>•</span>
            <span>
              Published:{" "}
              <span className="font-semibold">{stats.published}</span>
            </span>
            <span>•</span>
            <span>
              Archived: <span className="font-semibold">{stats.archived}</span>
            </span>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <button
            onClick={() => setStatusFilter("unpublished")}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              statusFilter === "unpublished"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
            )}
          >
            Unpublished
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              statusFilter === "published"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
            )}
          >
            Published
          </button>
          <button
            onClick={() => setStatusFilter("archived")}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              statusFilter === "archived"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
            )}
          >
            Archived
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
                  <p className="text-gray-500">
                    No {getStatusLabel(statusFilter).toLowerCase()} true/false
                    trivia questions found.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <TrueFalseTriviaCard
                    key={item.id}
                    item={item}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={clsx(
                          "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                          currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
                        )}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
