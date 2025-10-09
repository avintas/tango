'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import RecentContentFeed from '@/components/recent-content-feed';

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

// Fallback tags in case API fails
const FALLBACK_TAGS: ContentTag[] = [
  {
    id: 1,
    value: 'trivia_source',
    label: 'Trivia',
    color: '#3b82f6',
    icon: '📝',
    is_active: true,
    display_order: 1,
    usage_count: 0,
    created_at: '',
    updated_at: '',
  },
  {
    id: 2,
    value: 'quote_source',
    label: 'Quotes',
    color: '#f59e0b',
    icon: '💬',
    is_active: true,
    display_order: 2,
    usage_count: 0,
    created_at: '',
    updated_at: '',
  },
  {
    id: 3,
    value: 'story_source',
    label: 'Stories',
    color: '#10b981',
    icon: '📖',
    is_active: true,
    display_order: 3,
    usage_count: 0,
    created_at: '',
    updated_at: '',
  },
  {
    id: 4,
    value: 'news_source',
    label: 'News',
    color: '#ef4444',
    icon: '📰',
    is_active: true,
    display_order: 4,
    usage_count: 0,
    created_at: '',
    updated_at: '',
  },
  {
    id: 5,
    value: 'stats_source',
    label: 'Stats',
    color: '#8b5cf6',
    icon: '📊',
    is_active: true,
    display_order: 5,
    usage_count: 0,
    created_at: '',
    updated_at: '',
  },
  {
    id: 6,
    value: 'lore_source',
    label: 'Lore',
    color: '#ec4899',
    icon: '🏛️',
    is_active: true,
    display_order: 6,
    usage_count: 0,
    created_at: '',
    updated_at: '',
  },
  {
    id: 7,
    value: 'hugs_source',
    label: 'H.U.G.s',
    color: '#f97316',
    icon: '🤗',
    is_active: true,
    display_order: 7,
    usage_count: 0,
    created_at: '',
    updated_at: '',
  },
  {
    id: 8,
    value: 'geo_source',
    label: 'Geo',
    color: '#06b6d4',
    icon: '🌍',
    is_active: true,
    display_order: 8,
    usage_count: 0,
    created_at: '',
    updated_at: '',
  },
];

export default function SourcingPage() {
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<ContentTag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [feedRefresh, setFeedRefresh] = useState(0);
  const { session } = useAuth();

  const fetchTags = async () => {
    if (!session?.access_token) {
      setTagsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/content-tags', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      console.log('Tags API response:', result); // Debug log

      if (result.success) {
        setAvailableTags(result.data || []);
        console.log('Tags loaded:', result.data); // Debug log
      } else {
        console.error('Tags API error:', result.error);
        console.log('Using fallback tags');
        setAvailableTags(FALLBACK_TAGS);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      console.log('Using fallback tags due to error');
      setAvailableTags(FALLBACK_TAGS);
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const toggleTag = (tagValue: string) => {
    setSelectedTags(prev =>
      prev.includes(tagValue)
        ? prev.filter(t => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setSaveStatus('❌ Please enter some content to save.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('Saving to Supabase...');

    // If no tags selected, default to 'story_source' (article/note)
    const contentType =
      selectedTags.length > 0 ? selectedTags[0] : 'story_source';

    // Convert selected tag values to display labels for content_tags
    const tagLabels = selectedTags.map(
      tagValue =>
        availableTags.find(t => t.value === tagValue)?.label || tagValue
    );

    try {
      const response = await fetch('/api/sourced-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          original_text: content.trim(),
          content_type: contentType,
          content_tags: tagLabels, // Store display labels like ["Geo", "Stats"]
          word_count: content
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0).length,
          char_count: content.length,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus('✅ Content saved successfully to Supabase!');
        // Refresh the feed to show the new item
        setFeedRefresh(prev => prev + 1);
        // Clear content and status after successful save
        setTimeout(() => {
          setContent('');
          setSelectedTags([]);
          setSaveStatus('');
        }, 2000);
      } else {
        setSaveStatus(`❌ Save failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setSaveStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Content Sourcing</h1>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content Input
          </h3>

          {/* Content Type Tag Cloud */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Content Tags{' '}
              {selectedTags.length > 0 && (
                <span className="text-blue-600">
                  ({selectedTags.length} selected)
                </span>
              )}
            </label>
            {tagsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.value)}
                    className={`
                      px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105
                      ${
                        selectedTags.includes(tag.value)
                          ? 'text-white shadow-lg hover:shadow-xl ring-2 ring-blue-400 ring-offset-1'
                          : 'bg-white text-gray-700 shadow-sm hover:shadow-md border-2 border-gray-200 hover:border-blue-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:border-blue-500'
                      }
                    `}
                    style={{
                      backgroundColor: selectedTags.includes(tag.value)
                        ? tag.color
                        : undefined,
                    }}
                  >
                    {selectedTags.includes(tag.value) && (
                      <span className="mr-1.5 text-white opacity-80">✓</span>
                    )}
                    {tag.icon && <span className="mr-1.5">{tag.icon}</span>}
                    {tag.label}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Click tags to select multiple content types. If none selected,
              defaults to &quot;Stories&quot;.
            </p>
          </div>

          {/* Text Area */}
          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Paste your content here
            </label>
            <textarea
              id="content"
              rows={12}
              className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              placeholder="Paste any content you want to save to the database..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                {
                  content
                    .trim()
                    .split(/\s+/)
                    .filter(word => word.length > 0).length
                }{' '}
                words
              </span>
              <span>{content.length} characters</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            {content && (
              <button
                type="button"
                onClick={() => {
                  setContent('');
                  setSelectedTags([]);
                  setSaveStatus('');
                }}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Message */}
          {saveStatus && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {saveStatus}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Content Feed */}
      <div className="max-w-5xl mx-auto">
        <RecentContentFeed refreshTrigger={feedRefresh} />
      </div>
    </div>
  );
}
