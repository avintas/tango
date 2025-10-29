"use client";

import { useState, useEffect, useCallback } from "react";
import { Greeting } from "@/lib/greetings-types";
import GreetingCard from "@/components/greeting-card";

export default function GreetingsLibraryPage() {
  const [items, setItems] = useState<Greeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * limit;
      // Fetch active greetings only (published and draft, exclude archived)
      const response = await fetch(
        `/api/greetings?limit=${limit}&offset=${offset}&status=published,draft`,
      );
      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
        setTotal(result.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch greetings content:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleArchive = async (id: number) => {
    try {
      const response = await fetch(`/api/greetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Failed to archive greeting:", error);
      alert("Failed to archive item");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/greetings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Failed to delete greeting:", error);
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
          <h1 className="text-3xl font-bold text-gray-900">HUG Library</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and manage Hockey Universal Greetings - supportive messages
            for moral support and encouragement
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
                <p className="text-gray-500">No HUG content found.</p>
              </div>
            ) : (
              items.map((item) => (
                <GreetingCard
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
