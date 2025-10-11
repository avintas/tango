'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import { ContentSource } from '@/lib/supabase';

// Simple content display - no content types needed
const contentIcon = DocumentTextIcon;
const contentColor = 'bg-indigo-500';
const contentLabel = 'Hockey Content';

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
  const [items, setItems] = useState<ContentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchRecentItems = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/content-source?limit=10', {
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
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 p-3 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {truncateText(item.original_text, 100)}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <span>{item.word_count} words</span>
              <span>•</span>
              <span>{item.char_count} chars</span>
              <span>•</span>
              <time dateTime={item.created_at}>
                {formatTimeAgo(item.created_at)}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
