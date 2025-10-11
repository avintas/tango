'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClockIcon, TagIcon, UserIcon } from '@heroicons/react/24/outline';

interface TriviaSet {
  id: string;
  original_text: string;
  content_type: string;
  content_tags: string[];
  created_at: string;
  created_by: string;
}

export default function TriviaSetsPage() {
  const [triviaSets, setTriviaSets] = useState<TriviaSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTriviaSets();
  }, []);

  const fetchTriviaSets = async () => {
    try {
      const response = await fetch('/api/trivia-sets');
      if (response.ok) {
        const data = await response.json();
        setTriviaSets(data.triviaSets || []);
      }
    } catch (error) {
      console.error('Error fetching trivia sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getContentTypeLabel = (contentType: string) => {
    return contentType.replace('_source', '').replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto bg-blue-50 p-8 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trivia sets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-blue-50 p-8 rounded-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TriviaSets</h1>
        <p className="text-gray-600">Browse and play hockey trivia games</p>
      </div>

      {triviaSets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No trivia sets yet
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {triviaSets.map(triviaSet => (
            <Link
              key={triviaSet.id}
              href={`/trivia-sets/${triviaSet.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getContentTypeLabel(triviaSet.content_type)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(triviaSet.created_at)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {triviaSet.original_text.split('\n')[0] ||
                    'Untitled Trivia Set'}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {triviaSet.original_text.length > 150
                    ? `${triviaSet.original_text.substring(0, 150)}...`
                    : triviaSet.original_text}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDate(triviaSet.created_at)}
                    </span>
                  </div>
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Play Now →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
