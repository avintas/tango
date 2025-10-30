"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TriviaSet } from "@/lib/supabase";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function DraftTriviaSetsPage() {
  const router = useRouter();
  const [sets, setSets] = useState<TriviaSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<TriviaSet | null>(null);

  useEffect(() => {
    fetchDraftSets();
  }, []);

  const fetchDraftSets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("status", "Draft");
      params.append("limit", "100");

      const response = await fetch(`/api/trivia-sets?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setSets(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching draft trivia sets:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Draft Trivia Sets
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Work in progress trivia sets
            </p>
          </div>
          <Link
            href="/cms/trivia-sets/create"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4" />
            Create New Set
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sets List */}
          <div className="space-y-3">
            {sets.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No drafts yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Start creating a trivia set to see it here as a draft
                </p>
                <Link
                  href="/cms/trivia-sets/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create New Set
                </Link>
              </div>
            ) : (
              sets.map((set) => (
                <div
                  key={set.id}
                  onClick={() => setSelectedSet(set)}
                  className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                    selectedSet?.id === set.id
                      ? "border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                        {set.title}
                      </h3>
                      {set.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {set.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      <ClockIcon className="h-3 w-3" />
                      Draft
                    </span>

                    {set.question_count && (
                      <span className="text-xs text-gray-500">
                        {set.question_count} questions
                      </span>
                    )}
                  </div>

                  {set.tags && set.tags.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      {set.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                      {set.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{set.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>Last edited {formatDate(set.updated_at)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/cms/trivia-sets/edit/${set.id}`);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Edit →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedSet ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Preview
                  </h2>
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedSet.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      <ClockIcon className="h-3 w-3" />
                      Draft
                    </span>
                  </div>

                  {/* Description */}
                  {selectedSet.description && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">
                        Description
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedSet.description}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-xs font-semibold text-gray-700 mb-3">
                      Metadata
                    </h4>
                    <dl className="space-y-2 text-sm">
                      {selectedSet.theme && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Theme:</dt>
                          <dd className="font-medium text-gray-900">
                            {selectedSet.theme}
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Questions:</dt>
                        <dd className="font-medium text-gray-900">
                          {selectedSet.question_count}
                        </dd>
                      </div>
                      {selectedSet.estimated_time_minutes && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Est. Time:</dt>
                          <dd className="font-medium text-gray-900">
                            {selectedSet.estimated_time_minutes} min
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Last Updated:</dt>
                        <dd className="font-medium text-gray-900">
                          {formatDate(selectedSet.updated_at)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Tags */}
                  {selectedSet.tags && selectedSet.tags.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Tags
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedSet.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-gray-200 pt-4 flex justify-end gap-3">
                    <button
                      onClick={() =>
                        router.push(`/cms/trivia-sets/edit/${selectedSet.id}`)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Draft
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <EyeIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No set selected
                </h3>
                <p className="text-sm text-gray-500">
                  Select a draft to preview details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
