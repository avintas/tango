'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface ContentTag {
  id: number;
  value: string;
  label: string;
  color: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<ContentTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createStatus, setCreateStatus] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { session } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    color: '#6366f1',
    icon: '',
    description: '',
    display_order: 0,
  });

  const fetchTags = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/content-tags', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setTags(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, refreshTrigger]);

  const handleCreateTag = async () => {
    if (!formData.value.trim() || !formData.label.trim()) {
      setCreateStatus('❌ Value and Label are required.');
      return;
    }

    setCreateLoading(true);
    setCreateStatus('Creating tag...');

    try {
      const response = await fetch('/api/content-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setCreateStatus('✅ Tag created successfully!');
        setRefreshTrigger(prev => prev + 1);
        // Clear form and close
        setTimeout(() => {
          setFormData({
            value: '',
            label: '',
            color: '#6366f1',
            icon: '',
            description: '',
            display_order: 0,
          });
          setShowCreateForm(false);
          setCreateStatus('');
        }, 2000);
      } else {
        setCreateStatus(`❌ ${result.error || 'Failed to create tag'}`);
      }
    } catch (error) {
      setCreateStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTag = async (id: number, label: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the "${label}" tag? This will hide it from new content but won't affect existing content.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/content-tags?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setRefreshTrigger(prev => prev + 1);
        alert('Tag deleted successfully!');
      } else {
        alert(`Failed to delete tag: ${result.error}`);
      }
    } catch (error) {
      alert(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Content Tags</h1>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Content Tags</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Tag
          </button>
        </div>
      </div>

      {/* Create Tag Form */}
      {showCreateForm && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New Tag
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateStatus('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Value *
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={e =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  placeholder="e.g., halloween_source"
                  className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must end with &quot;_source&quot;
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="e.g., Halloween"
                  className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={e =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full h-10 rounded-md border border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="🎃"
                  className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description of this tag..."
                rows={2}
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={
                  createLoading ||
                  !formData.value.trim() ||
                  !formData.label.trim()
                }
                className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? 'Creating...' : 'Create Tag'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateStatus('');
                }}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>

            {createStatus && (
              <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {createStatus}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags List */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Tags ({tags.length})
          </h3>

          {tags.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No tags found</p>
              <p className="text-sm">Create your first tag to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {tag.label}
                      </span>
                      {tag.icon && <span className="text-lg">{tag.icon}</span>}
                    </div>
                    <button
                      onClick={() => handleDeleteTag(tag.id, tag.label)}
                      className="text-gray-400 hover:text-red-600 text-sm"
                      title="Delete tag"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {tag.value}
                      </span>
                    </div>

                    {tag.description && (
                      <p className="text-sm text-gray-600">{tag.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{tag.usage_count} uses</span>
                      <span>Order: {tag.display_order}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
