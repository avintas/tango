"use client";

import { useState, useEffect, useCallback } from "react";
import { Motivational } from "@/lib/motivational-types";
import MotivationalCard from "@/components/motivational-card";
import clsx from "clsx";

type StatusFilter = "unpublished" | "published" | "archived";

export default function MotivationalLibraryPage() {
  const [items, setItems] = useState<Motivational[]>([]);
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
      const response = await fetch(`/api/motivational?stats=true`);
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
        `/api/motivational?limit=${limit}&offset=${offset}&status=${statusFilter}`,
      );
      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
        setTotal(result.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch motivational content:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handleStatusChange = (id: number, newStatus: string) => {
    setItems(items.filter((item) => item.id !== id));
    setTotal((prev) => prev - 1);
    fetchStats();
  };

  const handleDelete = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
    setTotal((prev) => prev - 1);
    fetchStats();
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getStatusLabel = (status: StatusFilter) => {
    if (status === "unpublished") return "Unpublished";
    if (status === "published") return "Published";
    return "Archived";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Motivational Library
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
            <div className="space-y-3 mb-6">
              {items.length === 0 ? (
                <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
                  <p className="text-gray-500">
                    No {getStatusLabel(statusFilter).toLowerCase()} motivational
                    quotes found.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <MotivationalCard
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
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 rounded-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * limit, total)}
                      </span>{" "}
                      of <span className="font-medium">{total}</span>{" "}
                      {getStatusLabel(statusFilter).toLowerCase()} items
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <span className="text-sm">‹</span>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={clsx(
                              "relative inline-flex items-center px-4 py-2 text-sm font-semibold",
                              page === currentPage
                                ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
                            )}
                          >
                            {page}
                          </button>
                        ),
                      )}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <span className="text-sm">›</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
