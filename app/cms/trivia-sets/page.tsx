"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TriviaSet } from "@/lib/supabase";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import * as Headless from "@headlessui/react";
import SetPreviewPanel from "@/components/set-preview-panel";

type StatusColumn = "draft" | "review" | "approved";

export default function TriviaSetsDashboardPage() {
  const [sets, setSets] = useState<TriviaSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<TriviaSet | null>(null);

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trivia-sets?limit=200`);
      const result = await response.json();
      if (result.success) {
        setSets(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching trivia sets:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetStatus = async (setId: string, status: StatusColumn) => {
    try {
      const response = await fetch(`/api/trivia-sets?id=${setId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      // Optimistically update UI
      setSets(sets.map((s) => (s.id === setId ? { ...s, status } : s)));
    } catch (err) {
      alert(
        `Error updating status: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const columns: { id: StatusColumn; name: string }[] = [
    { id: "draft", name: "Drafts" },
    { id: "review", name: "In Review" },
    { id: "approved", name: "Approved" },
  ];

  const setsByColumn = (status: StatusColumn) =>
    sets.filter((s) => s.status === status);

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
              Trivia Sets Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your trivia set lifecycle from draft to approval
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

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span>{column.name}</span>
                <span className="text-gray-400">
                  {setsByColumn(column.id).length}
                </span>
              </h2>
              <div className="space-y-3">
                {setsByColumn(column.id).map((set) => (
                  <SetCard
                    key={set.id}
                    set={set}
                    onStatusChange={updateSetStatus}
                    onSelect={setSelectedSet}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <SetPreviewPanel
        set={selectedSet}
        open={selectedSet !== null}
        onClose={() => setSelectedSet(null)}
      />
    </div>
  );
}

function SetCard({
  set,
  onStatusChange,
  onSelect,
}: {
  set: TriviaSet;
  onStatusChange: (id: string, status: StatusColumn) => void;
  onSelect: (set: TriviaSet) => void;
}) {
  const timeSince = (date: string | Date): string => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000,
    );
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div
      className="bg-white rounded-md border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
      onClick={() => onSelect(set)}
    >
      <div>
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900 line-clamp-2">
            {set.title}
          </p>
          <SetActionsMenu set={set} onStatusChange={onStatusChange} />
        </div>

        {set.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {set.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {set.category && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {set.category}
            </span>
          )}
          {set.difficulty && (
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full capitalize">
              {set.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <span>{set.question_count || 0} questions</span>
        <span>•</span>
        <span>Updated {timeSince(set.updated_at)}</span>
      </div>
    </div>
  );
}

function SetActionsMenu({
  set,
  onStatusChange,
}: {
  set: TriviaSet;
  onStatusChange: (id: string, status: StatusColumn) => void;
}) {
  const nextStatus: { [key: string]: StatusColumn } = {
    draft: "review",
    review: "approved",
  };

  const nextActionName: { [key: string]: string } = {
    draft: "Submit for Review",
    review: "Approve",
  };

  const nextAction = nextStatus[set.status];
  const nextName = nextActionName[set.status];

  return (
    <Headless.Menu as="div" className="relative">
      <Headless.MenuButton className="p-1 text-gray-400 hover:text-gray-600">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </Headless.MenuButton>
      <Headless.Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Headless.MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Headless.MenuItem>
            <Link
              href={`/cms/trivia-sets/edit/${set.id}`}
              className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" /> Edit
            </Link>
          </Headless.MenuItem>
          {nextAction && (
            <Headless.MenuItem>
              <button
                onClick={() => onStatusChange(set.id, nextAction)}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 flex items-center gap-2"
              >
                <ArrowRightIcon className="h-4 w-4" /> {nextName}
              </button>
            </Headless.MenuItem>
          )}
        </Headless.MenuItems>
      </Headless.Transition>
    </Headless.Menu>
  );
}
