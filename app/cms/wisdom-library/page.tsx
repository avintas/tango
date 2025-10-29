"use client";

import { useState, useEffect } from "react";
import { Wisdom } from "@/lib/wisdom-types";

export default function WisdomLibraryPage() {
  const [items, setItems] = useState<Wisdom[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    fetchContent();
  }, [currentPage]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * limit;
      const response = await fetch(
        `/api/wisdom?limit=${limit}&offset=${offset}`,
      );
      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
        setTotal(result.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch wisdom content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const response = await fetch(`/api/wisdom/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Failed to archive wisdom:", error);
      alert("Failed to archive item");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/wisdom/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Failed to delete wisdom:", error);
      alert("Failed to delete item");
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Penalty Box Philosopher Library
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and manage witty and profound philosophical musings from the
            box.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-500">No wisdom content found.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-white border border-gray-300"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💎</span>
                    <div className="flex-1">
                      {item.title && (
                        <h3 className="text-sm font-semibold text-indigo-600 mb-1">
                          {item.title}
                        </h3>
                      )}
                      <div className="space-y-2">
                        <p className="text-gray-900 italic">
                          &quot;{item.musing}&quot;
                        </p>
                        <p className="text-gray-700 text-sm">
                          <span className="font-semibold">From the box:</span>{" "}
                          {item.from_the_box}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-indigo-600 capitalize">
                          Wisdom
                        </span>
                        {item.theme && (
                          <span className="text-xs text-gray-700">
                            • {item.theme}
                          </span>
                        )}
                        {item.category && (
                          <span className="text-xs text-gray-700">
                            • {item.category}
                          </span>
                        )}
                        {item.attribution && (
                          <span className="text-xs text-gray-700">
                            • {item.attribution}
                          </span>
                        )}
                        <span className="text-xs text-gray-700">
                          ID: {item.id}
                        </span>

                        {/* Archive/Delete buttons */}
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => handleArchive(item.id)}
                            className="text-xs text-gray-600 hover:text-gray-900"
                            title="Archive"
                          >
                            🗄️
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-xs text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
