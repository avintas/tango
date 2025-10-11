'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClockIcon, PlayIcon } from '@heroicons/react/24/outline';

interface TriviaSet {
  id: string;
  original_text: string;
  content_type: string;
  content_tags: string[];
  created_at: string;
}

export default function RecentPage() {
  const [recentTriviaSets, setRecentTriviaSets] = useState<TriviaSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTriviaSets();
  }, []);

  const fetchRecentTriviaSets = async () => {
    try {
      const response = await fetch('/api/trivia-sets');
      if (response.ok) {
        const data = await response.json();
        const triviaSets = data.triviaSets || [];

        // Sort by created_at descending and take the 10 most recent
        const recent = triviaSets
          .sort(
            (a: TriviaSet, b: TriviaSet) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 10);

        setRecentTriviaSets(recent);
      }
    } catch (error) {
      console.error('Error fetching recent trivia sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    return contentType.replace('_source', '').replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto bg-blue-50 p-8 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recent trivia sets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-blue-50 p-8 rounded-lg">
      <div className="mb-8">
        <Link
          href="/trivia-sets"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to TriviaSets
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Recent TriviaSets
        </h1>
        <p className="text-gray-600">
          The latest trivia games you&apos;ve generated
        </p>
      </div>

      {recentTriviaSets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ClockIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No recent trivia sets
          </h3>
          <p className="text-gray-500 mb-4">
            Generate some trivia content to see it here
          </p>
          <Link
            href="/cms/trivia-generator"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Generate Trivia
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recentTriviaSets.map((triviaSet, index) => (
            <div
              key={triviaSet.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      #{index + 1}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getContentTypeLabel(triviaSet.content_type)}
                    </span>
                    <span className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {formatDate(triviaSet.created_at)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {triviaSet.original_text.split('\n')[0] ||
                      'Untitled Trivia Set'}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {triviaSet.original_text.length > 200
                      ? `${triviaSet.original_text.substring(0, 200)}...`
                      : triviaSet.original_text}
                  </p>

                  {triviaSet.content_tags &&
                    triviaSet.content_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {triviaSet.content_tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {tag.replace('_source', '')}
                          </span>
                        ))}
                      </div>
                    )}
                </div>

                <div className="ml-4 flex-shrink-0">
                  <Link
                    href={`/trivia-sets/${triviaSet.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Play Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
