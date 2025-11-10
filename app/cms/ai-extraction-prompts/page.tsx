"use client";

import { useState, useEffect, useCallback } from "react";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import type { AIExtractionPrompt, PromptType } from "@/lib/supabase";
import {
  ClipboardDocumentIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";

export default function AIExtractionPromptsPage() {
  const [prompts, setPrompts] = useState<AIExtractionPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] =
    useState<AIExtractionPrompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    prompt_name: "",
    prompt_content: "",
    description: "",
    is_active: true,
  });

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai-extraction-prompts");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch prompts");
      }

      setPrompts(result.data || []);

      // Auto-select metadata_extraction prompt if available
      if (!selectedPrompt && result.data) {
        const metadataPrompt = result.data.find(
          (p: AIExtractionPrompt) =>
            p.prompt_type === "metadata_extraction" && p.is_active,
        );
        if (metadataPrompt) {
          setSelectedPrompt(metadataPrompt);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPrompt]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleSelectPrompt = (prompt: AIExtractionPrompt) => {
    setSelectedPrompt(prompt);
    setIsEditing(false);
    setEditForm({
      prompt_name: prompt.prompt_name,
      prompt_content: prompt.prompt_content,
      description: prompt.description || "",
      is_active: prompt.is_active,
    });
  };

  const handleSave = async () => {
    if (!selectedPrompt) return;

    try {
      const response = await fetch("/api/ai-extraction-prompts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedPrompt.id,
          ...editForm,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update prompt");
      }

      // Refresh prompts
      await fetchPrompts();
      setIsEditing(false);

      // Update selected prompt
      if (result.data) {
        setSelectedPrompt(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleToggleActive = async (prompt: AIExtractionPrompt) => {
    try {
      const response = await fetch("/api/ai-extraction-prompts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: prompt.id,
          is_active: !prompt.is_active,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update prompt");
      }

      await fetchPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle");
    }
  };

  const getPromptTypeLabel = (type: PromptType) => {
    return type === "metadata_extraction"
      ? "Metadata Extraction"
      : "Content Enrichment";
  };

  const getPromptTypeColor = (type: PromptType) => {
    return type === "metadata_extraction"
      ? "bg-indigo-100 text-indigo-800"
      : "bg-purple-100 text-purple-800";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>AI Extraction Prompts</Heading>
        <Button variant="outline" onClick={fetchPrompts} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      <p className="text-gray-600">
        Manage AI prompts used for metadata extraction and content enrichment in
        the source content ingestion workflow.
      </p>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Prompt List */}
        <div className="md:col-span-1 space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Prompts</h3>
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : prompts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No prompts found. Run the SQL migration to create initial prompts.
            </div>
          ) : (
            <div className="space-y-2">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPrompt?.id === prompt.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {prompt.prompt_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {getPromptTypeLabel(prompt.prompt_type)}
                      </p>
                      {prompt.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {prompt.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          prompt.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {prompt.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Prompt Editor */}
        <div className="md:col-span-2">
          {selectedPrompt ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedPrompt.prompt_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getPromptTypeColor(selectedPrompt.prompt_type)}`}
                    >
                      {getPromptTypeLabel(selectedPrompt.prompt_type)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        selectedPrompt.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {selectedPrompt.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleActive(selectedPrompt)}
                  >
                    {selectedPrompt.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prompt Name
                    </label>
                    <Input
                      value={editForm.prompt_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          prompt_name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Input
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Optional description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prompt Content
                    </label>
                    <Textarea
                      value={editForm.prompt_content}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          prompt_content: e.target.value,
                        })
                      }
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={editForm.is_active}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm text-gray-700"
                    >
                      Active (only active prompts are used in workflow)
                    </label>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleSave}
                    className="w-full"
                  >
                    <CircleStackIcon className="h-5 w-5 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPrompt.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Description
                      </h4>
                      <p className="text-sm text-gray-900">
                        {selectedPrompt.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Prompt Content
                    </h4>
                    <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                      {selectedPrompt.prompt_content}
                    </pre>
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <p>
                      Created:{" "}
                      {new Date(selectedPrompt.created_at).toLocaleString()}
                    </p>
                    <p>
                      Updated:{" "}
                      {new Date(selectedPrompt.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-500">
                Select a prompt from the list to view and edit it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
