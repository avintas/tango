'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TagIcon, PlayIcon } from '@heroicons/react/24/outline';

interface TriviaSet {
  id: string;
  original_text: string;
  content_type: string;
  content_tags: string[];
  created_at: string;
}

interface CategoryData {
  category: string;
  count: number;
  triviaSets: TriviaSet[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/trivia-sets');
      if (response.ok) {
        const data = await response.json();
        const triviaSets = data.triviaSets || [];

        // Group trivia sets by content tags
        const categoryMap = new Map<string, TriviaSet[]>();

        triviaSets.forEach((triviaSet: TriviaSet) => {
          if (triviaSet.content_tags && triviaSet.content_tags.length > 0) {
            triviaSet.content_tags.forEach(tag => {
              const category = tag
                .replace('_source', '')
                .replace('_', ' ')
                .toUpperCase();
              if (!categoryMap.has(category)) {
                categoryMap.set(category, []);
              }
              categoryMap.get(category)!.push(triviaSet);
            });
          } else {
            // Fallback to content_type
            const category = triviaSet.content_type
              .replace('_source', '')
              .replace('_', ' ')
              .toUpperCase();
            if (!categoryMap.has(category)) {
              categoryMap.set(category, []);
            }
            categoryMap.get(category)!.push(triviaSet);
          }
        });

        // Convert to array and sort by count
        const categoryArray: CategoryData[] = Array.from(
          categoryMap.entries()
        ).map(([category, triviaSets]) => ({
          category,
          count: triviaSets.length,
          triviaSets: triviaSets.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          ),
        }));

        setCategories(categoryArray.sort((a, b) => b.count - a.count));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto bg-blue-50 p-8 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
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
          Trivia Categories
        </h1>
        <p className="text-gray-600">Browse trivia sets by category</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <TagIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No categories yet
          </h3>
          <p className="text-gray-500 mb-4">
            Generate some trivia content with tags to see categories
          </p>
          <Link
            href="/cms/trivia-generator"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Generate Trivia
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => (
            <div
              key={category.category}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2 text-blue-600" />
                  {category.category}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {category.count} trivia set{category.count !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.triviaSets.map(triviaSet => (
                  <Link
                    key={triviaSet.id}
                    href={`/trivia-sets/${triviaSet.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 hover:border-blue-300"
                  >
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {triviaSet.original_text.split('\n')[0] ||
                        'Untitled Trivia Set'}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {triviaSet.original_text.length > 100
                        ? `${triviaSet.original_text.substring(0, 100)}...`
                        : triviaSet.original_text}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDate(triviaSet.created_at)}
                      </span>
                      <span className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700">
                        <PlayIcon className="h-3 w-3 mr-1" />
                        Play
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
