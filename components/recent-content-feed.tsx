'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import { SourcedText } from '@/lib/supabase';

const contentTypeIcons = {
  trivia_source: DocumentTextIcon,
  story_source: ChatBubbleLeftRightIcon,
  quote_source: ChatBubbleOvalLeftIcon,
  news_source: NewspaperIcon,
  stats_source: DocumentTextIcon,
  lore_source: ChatBubbleLeftRightIcon,
  hugs_source: ChatBubbleOvalLeftIcon,
  geo_source: NewspaperIcon,
};

const contentTypeColors = {
  trivia_source: 'bg-blue-500',
  story_source: 'bg-green-500',
  quote_source: 'bg-yellow-500',
  news_source: 'bg-red-500',
  stats_source: 'bg-purple-500',
  lore_source: 'bg-pink-500',
  hugs_source: 'bg-orange-500',
  geo_source: 'bg-teal-500',
};

const contentTypeLabels = {
  trivia_source: 'Trivia',
  story_source: 'Story',
  quote_source: 'Quote',
  news_source: 'News',
  stats_source: 'Stats',
  lore_source: 'Lore',
  hugs_source: 'H.U.G.s',
  geo_source: 'Geo',
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

function truncateText(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

interface RecentContentFeedProps {
  refreshTrigger?: number; // Increment this to refresh the feed
}

export default function RecentContentFeed({
  refreshTrigger,
}: RecentContentFeedProps) {
  const [items, setItems] = useState<SourcedText[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchRecentItems = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/sourced-text?limit=10', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Content
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Content
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No content yet</p>
          <p className="text-sm">Start adding content to see it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Content
      </h3>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {items.map((item, eventIdx) => {
            const IconComponent = contentTypeIcons[item.content_type];
            const iconColor = contentTypeColors[item.content_type];
            const label = contentTypeLabels[item.content_type];

            return (
              <li key={item.id}>
                <div className="relative pb-8">
                  {eventIdx !== items.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={classNames(
                          iconColor,
                          'flex size-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900'
                        )}
                      >
                        <IconComponent
                          aria-hidden="true"
                          className="size-5 text-white"
                        />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">
                            [{label}]
                          </span>{' '}
                          {truncateText(item.original_text)}
                        </p>
                        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {item.word_count} words • {item.char_count} characters
                        </div>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                        <time dateTime={item.created_at}>
                          {formatTimeAgo(item.created_at)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
