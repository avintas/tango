"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import ContentCard from "@/components/content-card";

interface HeroCollection {
  id: number;
  title: string;
  description: string | null;
  content_items: ContentItem[];
  active: boolean;
  display_order: number;
}

interface ContentItem {
  id: number;
  content_text: string;
  content_type: string;
  theme: string;
}

export default function HeroCollectionsPage() {
  const [collections, setCollections] = useState<HeroCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(
    null,
  );
  const [previewContent, setPreviewContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New collection form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [generatedContent, setGeneratedContent] = useState<ContentItem[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("hero_collections")
        .select("*")
        .order("display_order", { ascending: true });

      if (fetchError) throw fetchError;

      setCollections(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch collections",
      );
    } finally {
      setLoading(false);
    }
  };

  const previewCollection = async (
    collectionId: number,
    contentItems: ContentItem[],
  ) => {
    setSelectedCollection(collectionId);
    setError(null);
    setPreviewContent(contentItems);
  };

  const handleArchivePreview = (id: number) => {
    setPreviewContent(previewContent.filter((item) => item.id !== id));
    setGeneratedContent(generatedContent.filter((item) => item.id !== id));
  };

  const handleDeletePreview = (id: number) => {
    setPreviewContent(previewContent.filter((item) => item.id !== id));
    setGeneratedContent(generatedContent.filter((item) => item.id !== id));
  };

  // Fisher-Yates shuffle algorithm
  const fisherYatesShuffle = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateRandomCollection = async () => {
    setGenerating(true);
    setError(null);

    try {
      // Define desired distribution (7 total items)
      const distribution = [
        { type: "motivational", count: 2 },
        { type: "statistic", count: 2 },
        { type: "wisdom", count: 2 },
        { type: "greeting", count: 1 },
      ];

      const selectedItems: ContentItem[] = [];

      // Fetch and select items for each content type
      for (const { type, count } of distribution) {
        const { data, error: fetchError } = await supabase
          .from("content")
          .select("id, content_text, content_type, theme, attribution")
          .eq("content_type", type)
          .or("status.is.null,status.neq.archived,status.neq.deleted")
          .limit(50); // Get pool to choose from

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          setError(`Not enough published ${type} content available`);
          return;
        }

        // Shuffle and pick the required count
        const shuffled = fisherYatesShuffle(data);
        const picked = shuffled.slice(0, Math.min(count, data.length));
        selectedItems.push(...(picked as ContentItem[]));
      }

      if (selectedItems.length < 7) {
        setError(`Only found ${selectedItems.length} items, need 7 total`);
        return;
      }

      // Final shuffle to mix the types
      const finalCollection = fisherYatesShuffle(selectedItems);

      setGeneratedContent(finalCollection);
      setPreviewContent(finalCollection);
      setShowNewForm(true);
      setSuccess(
        "Generated balanced collection with variety! Review and save if you like it.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate collection",
      );
    } finally {
      setGenerating(false);
    }
  };

  const saveNewCollection = async () => {
    if (!newName.trim()) {
      setError("Please provide a name for the collection");
      return;
    }

    if (generatedContent.length !== 7) {
      setError("Collection must have exactly 7 items");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextOrder =
        collections.length > 0
          ? Math.max(...collections.map((c) => c.display_order)) + 1
          : 1;

      const { error: insertError } = await supabase
        .from("hero_collections")
        .insert({
          title: newName.trim(),
          description: newDescription.trim() || null,
          content_items: generatedContent,
          display_order: nextOrder,
          active: true,
        });

      if (insertError) throw insertError;

      setSuccess("Collection saved successfully!");
      setShowNewForm(false);
      setNewName("");
      setNewDescription("");
      setGeneratedContent([]);
      setPreviewContent([]);
      fetchCollections();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save collection",
      );
    } finally {
      setLoading(false);
    }
  };

  const testRandomAPI = async () => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/hero-collections/default");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch random collection");
        return;
      }

      setSuccess(
        `Random API returned: "${data.collection_name}" with ${data.count} items (${data.total_available} collections available)`,
      );
      setSelectedCollection(data.collection_id);
      setPreviewContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to test API");
    }
  };

  if (loading && collections.length === 0) {
    return (
      <div className="p-8">
        <Heading level={1}>Hero Collections</Heading>
        <p className="mt-4 text-gray-400">Loading collections...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Heading level={1}>Hero Collections Manager</Heading>
        <p className="mt-2 text-gray-400">
          Generate and manage curated collections for the OnlyHockey hero
          section
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}

      {success && (
        <div className="mb-6">
          <Alert type="success" message={success} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-8 flex gap-4">
        <Button
          onClick={generateRandomCollection}
          variant="primary"
          disabled={generating}
        >
          {generating ? "🎲 Generating..." : "🎲 Generate Random Collection"}
        </Button>
        <Button onClick={testRandomAPI} variant="outline">
          🧪 Test Random API
        </Button>
      </div>

      {/* New Collection Form */}
      {showNewForm && (
        <div className="mb-8 p-6 rounded-lg bg-white border-2 border-indigo-500">
          <Heading level={2} className="mb-4">
            Save New Collection
          </Heading>

          <div className="space-y-4 mb-4">
            <Input
              label="Collection Name"
              placeholder="e.g., Legendary Motivation"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Textarea
              label="Description (optional)"
              placeholder="Brief description of this collection..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={saveNewCollection} variant="primary">
              💾 Save Collection
            </Button>
            <Button
              onClick={generateRandomCollection}
              variant="outline"
              disabled={generating}
            >
              🔄 Regenerate
            </Button>
            <Button
              onClick={() => {
                setShowNewForm(false);
                setNewName("");
                setNewDescription("");
                setGeneratedContent([]);
                setPreviewContent([]);
              }}
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Collections List */}
        <div>
          <Heading level={2} className="mb-4">
            Collections ({collections.length})
          </Heading>

          <div className="space-y-2">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedCollection === collection.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
                onClick={() =>
                  previewCollection(collection.id, collection.content_items)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {collection.title}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-gray-700 mt-1">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-700">
                      {collection.content_items.length} items
                    </p>
                    {collection.active && (
                      <span className="text-xs text-green-600">● Active</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {collections.length === 0 && (
              <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                No collections yet. Generate your first one!
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div>
          <Heading level={2} className="mb-4">
            {showNewForm
              ? "Preview: New Collection"
              : selectedCollection
                ? `Preview: ${collections.find((c) => c.id === selectedCollection)?.title}`
                : "Select a collection to preview"}
          </Heading>

          {previewContent.length > 0 ? (
            <div className="space-y-3">
              {previewContent.map((item, index) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  index={index}
                  showNumber={true}
                  onArchive={handleArchivePreview}
                  onDelete={handleDeletePreview}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-white">
              {showNewForm
                ? "Generate a collection to preview"
                : "Click on a collection to preview its content"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
