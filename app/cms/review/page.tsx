'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ContentProcessed } from '@/lib/supabase';
import {
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function ReviewPage() {
  const { session } = useAuth();
  const [contentItems, setContentItems] = useState<ContentProcessed[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentProcessed | null>(
    null
  );
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchContent();
  }, [filter, refreshTrigger, session]);

  const fetchContent = async () => {
    if (!session) return;

    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      params.append('limit', '50');

      const response = await fetch(
        `/api/content-processed?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setContentItems(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (
    id: number,
    currentStatus: 'draft' | 'published'
  ) => {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    const action = newStatus === 'published' ? 'Publishing' : 'Unpublishing';

    if (
      !confirm(`Are you sure you want to ${action.toLowerCase()} this content?`)
    ) {
      return;
    }

    try {
      const response = await fetch('/api/content-processed', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          published_at:
            newStatus === 'published' ? new Date().toISOString() : null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`Content ${newStatus}ed successfully!`);
        setRefreshTrigger(prev => prev + 1);
        if (selectedItem?.id === id) {
          setSelectedItem({ ...selectedItem, status: newStatus });
        }
      } else {
        alert(`Failed to ${action.toLowerCase()} content: ${result.error}`);
      }
    } catch (error) {
      alert(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const getContentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      trivia: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      quotes:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      stats:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      articles:
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      lore: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      hugs: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    };
    return (
      colors[type] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Review & Publish
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review AI-generated content and publish when ready
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto">
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All ({contentItems.length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === 'draft'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Drafts
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === 'published'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Published
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content List */}
          <div className="space-y-3">
            {contentItems.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No content
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Generate content from the Processing page
                </p>
              </div>
            ) : (
              contentItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-white dark:bg-gray-800 rounded-lg border p-4 cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getContentTypeColor(
                            item.content_type
                          )}`}
                        >
                          {item.content_type}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            item.status === 'published'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}
                        >
                          {item.status === 'published' ? (
                            <>
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Draft
                            </>
                          )}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()} at{' '}
                        {new Date(item.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handlePublishToggle(item.id, item.status);
                      }}
                      className={`ml-3 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        item.status === 'published'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {item.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedItem ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Preview
                  </h2>
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedItem.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getContentTypeColor(
                          selectedItem.content_type
                        )}`}
                      >
                        {selectedItem.content_type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(selectedItem.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md text-xs overflow-x-auto">
                        {selectedItem.markdown_content}
                      </pre>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end">
                    <button
                      onClick={() =>
                        handlePublishToggle(
                          selectedItem.id,
                          selectedItem.status
                        )
                      }
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        selectedItem.status === 'published'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {selectedItem.status === 'published'
                        ? 'Unpublish'
                        : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No content selected
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select an item to preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
