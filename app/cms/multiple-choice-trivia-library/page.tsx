"use client";

import { useState, useEffect, useCallback } from "react";
import { MultipleChoiceTrivia } from "@/lib/multiple-choice-trivia-types";
import MultipleChoiceTriviaCard from "@/components/multiple-choice-trivia-card";

export default function MultipleChoiceTriviaLibraryPage() {
  const [items, setItems] = useState<MultipleChoiceTrivia[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * limit;
      // Fetch active trivia questions only (published and draft, exclude archived)
      const response = await fetch(
        `/api/multiple-choice-trivia?limit=${limit}&offset=${offset}&status=published,draft`,
      );
      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
        setTotal(result.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch multiple choice trivia:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleArchive = async (id: number) => {
    try {
      const response = await fetch(`/api/multiple-choice-trivia/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Failed to archive trivia question:", error);
      alert("Failed to archive item");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/multiple-choice-trivia/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Failed to delete trivia question:", error);
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
            📋 Multiple Choice Trivia Library
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and manage multiple-choice trivia questions
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
                <p className="text-gray-500">
                  No multiple-choice trivia questions found.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <MultipleChoiceTriviaCard
                  key={item.id}
                  item={item}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
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
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
