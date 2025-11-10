"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import RecipeForm from "@/components/recipes/recipe-form";
import type { RecipeCreateInput } from "@/lib/recipes/types";

export default function CreateRecipePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (recipe: RecipeCreateInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create recipe");
      }

      // Redirect to recipes page
      router.push("/cms/recipes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create recipe");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/cms/recipes");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Heading level={1}>Create Recipe</Heading>
          <p className="text-sm text-gray-600 mt-2">
            Create a reusable recipe template for building trivia sets
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <RecipeForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}
