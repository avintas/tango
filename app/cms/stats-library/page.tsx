"use client";

import { useState, useEffect, useCallback } from "react";
import { Stat } from "@/lib/stats-types";
import StatCard from "@/components/stat-card";

export default function StatsLibraryPage() {
  const [items, setItems] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * limit;
      // Fetch active stats only (published and draft, exclude archived)
      const response = await fetch(
        `/api/stats?limit=${limit}&offset=${offset}&status=published,draft`,
      );
      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
        setTotal(result.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch stats content:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleArchive = async (id: number) => {
    try {
      const response = await fetch(`/api/stats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Failed to archive stat:", error);
      alert("Failed to archive item");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/stats/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Failed to delete stat:", error);
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
          <h1 className="text-3xl font-bold text-gray-900">Stats Library</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and manage hockey statistics - player stats, team records,
            league milestones, and historical achievements
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
                <p className="text-gray-500">No stats content found.</p>
              </div>
            ) : (
              items.map((item) => (
                <StatCard
                  key={item.id}
                  item={item}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        )}

        {/* Pagination would go here */}
      </div>
    </div>
  );
}
