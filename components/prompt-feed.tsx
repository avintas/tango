'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftIcon,
  NewspaperIcon,
  CogIcon,
  SparklesIcon,
  BookOpenIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  content_type: string;
  ai_service: string;
  success_rate: number;
  usage_count: number;
  created_at: string;
}

const contentTypeIcons = {
  article: DocumentTextIcon,
  trivia_multiple_choice: ChatBubbleLeftRightIcon,
  trivia_true_false: ChatBubbleLeftRightIcon,
  quote: ChatBubbleOvalLeftIcon,
  story: BookOpenIcon,
  hugs: HeartIcon,
  lore: SparklesIcon,
};

const contentTypeColors = {
  article: 'bg-blue-500',
  trivia_multiple_choice: 'bg-green-500',
  trivia_true_false: 'bg-green-600',
  quote: 'bg-yellow-500',
  story: 'bg-purple-500',
  hugs: 'bg-pink-500',
  lore: 'bg-indigo-500',
};

const contentTypeLabels = {
  article: 'Article',
  trivia_multiple_choice: 'Multiple Choice',
  trivia_true_false: 'True/False',
  quote: 'Quote',
  story: 'Story',
  hugs: 'H.U.G.s',
  lore: 'Lore',
};

const aiServiceColors = {
  gemini:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  claude:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  gpt4: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  deepseek: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  grok: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
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

interface PromptFeedProps {
  refreshTrigger?: number;
}

export default function PromptFeed({ refreshTrigger }: PromptFeedProps) {
  const [items, setItems] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchPrompts = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/prompts?limit=10', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Prompt Templates
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
          Recent Prompt Templates
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CogIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No prompt templates yet</p>
          <p className="text-sm">Create your first prompt template above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Prompt Templates
      </h3>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {items.map((item, eventIdx) => {
            const IconComponent =
              contentTypeIcons[
                item.content_type as keyof typeof contentTypeIcons
              ];
            const iconColor =
              contentTypeColors[
                item.content_type as keyof typeof contentTypeColors
              ];
            const label =
              contentTypeLabels[
                item.content_type as keyof typeof contentTypeLabels
              ];
            const aiColor =
              aiServiceColors[item.ai_service as keyof typeof aiServiceColors];

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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <span
                            className={classNames(
                              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                              aiColor
                            )}
                          >
                            {item.ai_service}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">[{label}]</span>{' '}
                          {item.description && truncateText(item.description)}
                        </p>
                        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {item.usage_count} uses •{' '}
                          {(item.success_rate * 100).toFixed(0)}% success rate
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
