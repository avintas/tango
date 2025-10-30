"use client";

import { useState, useEffect } from "react";
import CategoryForm from "@/components/category-form";
import type { Category } from "@/lib/supabase";

export default function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/categories/${id}`);
        const result = await response.json();
        if (result.success) {
          setCategory(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch category data.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-sm text-gray-600 mt-1">
          Update the details for this category.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {loading && <p>Loading category...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && category && (
          <CategoryForm category={category} isEditing={true} />
        )}
      </div>
    </div>
  );
}
