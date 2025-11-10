"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import clsx from "clsx";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type StatusFilter = "draft" | "published";

interface TriviaSetTrueFalse {
  id: number;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  theme?: string;
  difficulty?: string;
  tags: string[];
  question_count: number;
  question_data: any[];
  status: string;
  visibility: string;
  created_at: string;
}

export default function TriviaSetsTrueFalseLibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") as StatusFilter) || "draft";

  const [items, setItems] = useState<TriviaSetTrueFalse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState({
    draft: 0,
    published: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/trivia-sets/true-false?status=${statusFilter}`,
      );
      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
        if (result.stats) {
          setStats(result.stats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch trivia sets:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const statusFromUrl =
      (searchParams.get("status") as StatusFilter) || "draft";
    if (statusFromUrl !== statusFilter) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams, statusFilter]);

  useEffect(() => {
    fetchData();
    setSelectedIds(new Set());
  }, [fetchData]);

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Publish ${selectedIds.size} trivia set(s)?`)) return;

    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/trivia-sets/true-false/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "published" }),
        }),
      );

      await Promise.all(promises);
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error("Failed to publish:", error);
      alert("Failed to publish some sets");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (
      !confirm(
        `Delete ${selectedIds.size} trivia set(s)? This cannot be undone.`,
      )
    )
      return;

    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/trivia-sets/true-false/${id}`, {
          method: "DELETE",
        }),
      );

      await Promise.all(promises);
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete some sets");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this trivia set? This cannot be undone.")) return;

    try {
      const response = await fetch(`/api/trivia-sets/true-false/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Heading level={1}>⚖️ True/False Trivia Sets</Heading>
          <p className="mt-2 text-gray-600">
            Curated True/False trivia sets ready to play
          </p>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <span>
              Total:{" "}
              <span className="font-semibold">
                {stats.draft + stats.published}
              </span>
            </span>
            <span>•</span>
            <span>
              Draft: <span className="font-semibold">{stats.draft}</span>
            </span>
            <span>•</span>
            <span>
              Published:{" "}
              <span className="font-semibold">{stats.published}</span>
            </span>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <button
            onClick={() => setStatusFilter("draft")}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              statusFilter === "draft"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
            )}
          >
            Draft
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
        </div>

        {/* Bulk Actions */}
        {items.length > 0 && statusFilter === "draft" && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.size === items.length && items.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({selectedIds.size} selected)
              </span>
            </label>

            {selectedIds.size > 0 && (
              <>
                <Button
                  variant="primary"
                  onClick={handleBulkPublish}
                  className="ml-auto"
                >
                  📤 Publish Selected ({selectedIds.size})
                </Button>
                <Button variant="danger" onClick={handleBulkDelete}>
                  🗑️ Delete Selected ({selectedIds.size})
                </Button>
              </>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              No {statusFilter} True/False trivia sets found.
            </p>
            <Link
              href="/cms/process-builders/build-trivia-set"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
            >
              Create your first set →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
              >
                {/* Checkbox */}
                {statusFilter === "draft" && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                )}

                {/* Icon */}
                <span className="text-2xl">⚖️</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500">{item.slug}</p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {item.theme && (
                        <>
                          <span className="text-blue-600 font-medium">
                            {item.theme}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>{item.question_count} questions</span>
                      {item.difficulty && (
                        <>
                          <span>•</span>
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded font-medium",
                              item.difficulty === "easy" &&
                                "bg-green-100 text-green-800",
                              item.difficulty === "medium" &&
                                "bg-yellow-100 text-yellow-800",
                              item.difficulty === "hard" &&
                                "bg-red-100 text-red-800",
                            )}
                          >
                            {item.difficulty}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          item.status === "published" &&
                            "bg-green-100 text-green-800",
                          item.status === "draft" &&
                            "bg-gray-100 text-gray-800",
                        )}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          router.push(
                            `/cms/trivia-sets-true-false-library/${item.id}`,
                          )
                        }
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
