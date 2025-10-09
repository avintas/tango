'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  EllipsisVerticalIcon,
  DocumentTextIcon,
  ChartBarIcon,
  HeartIcon,
  SparklesIcon,
  BookOpenIcon,
  NewspaperIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface ProductionCategory {
  id: string;
  name: string;
  description: string;
  content_type: string;
  item_count: number;
  color: string;
  icon: string;
}

interface SourcedText {
  id: number;
  original_text: string;
  content_type: string;
  word_count: number;
  char_count: number;
  created_at: string;
}

export default function ProcessingPage() {
  const [productionCategories, setProductionCategories] = useState<
    ProductionCategory[]
  >([]);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductionCategory | null>(null);
  const [contentItems, setContentItems] = useState<SourcedText[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const { session } = useAuth();

  // Production category icons mapping
  const productionIcons = {
    trivia: ChartBarIcon,
    quotes: UserGroupIcon,
    stats: DocumentTextIcon,
    articles: BookOpenIcon,
    lore: SparklesIcon,
    hugs: HeartIcon,
  };

  // Production category colors
  const productionColors = {
    trivia: 'bg-blue-500',
    quotes: 'bg-purple-500',
    stats: 'bg-green-500',
    articles: 'bg-orange-500',
    lore: 'bg-yellow-500',
    hugs: 'bg-pink-500',
  };

  useEffect(() => {
    // Define production categories
    const productionCategoriesData: ProductionCategory[] = [
      {
        id: 'trivia',
        name: 'Trivia Sets',
        description: 'Multiple choice and true/false questions',
        content_type: 'trivia_multiple_choice',
        item_count: 0,
        color: 'bg-blue-500',
        icon: 'trivia',
      },
      {
        id: 'quotes',
        name: 'Quotes',
        description: 'Player and coach inspirational quotes',
        content_type: 'quote',
        item_count: 0,
        color: 'bg-purple-500',
        icon: 'quotes',
      },
      {
        id: 'stats',
        name: 'Statistics',
        description: 'Statistical information and records',
        content_type: 'lore',
        item_count: 0,
        color: 'bg-green-500',
        icon: 'stats',
      },
      {
        id: 'articles',
        name: 'Articles',
        description: 'Full articles and stories',
        content_type: 'story',
        item_count: 0,
        color: 'bg-orange-500',
        icon: 'articles',
      },
      {
        id: 'lore',
        name: 'Hockey Lore',
        description: 'Historical facts and legends',
        content_type: 'lore',
        item_count: 0,
        color: 'bg-yellow-500',
        icon: 'lore',
      },
      {
        id: 'hugs',
        name: 'H.U.G.s',
        description: 'Encouraging content for youth players',
        content_type: 'hugs',
        item_count: 0,
        color: 'bg-pink-500',
        icon: 'hugs',
      },
    ];

    setProductionCategories(productionCategoriesData);
    setLoading(false);
  }, []);

  const handleCategoryClick = async (category: ProductionCategory) => {
    setSelectedCategory(category);
    setContentLoading(true);

    try {
      // Fetch source content appropriate for the production type
      let contentType = '';

      // Map production types to appropriate source content types
      switch (category.id) {
        case 'quotes':
          contentType = 'quote_source';
          break;
        case 'trivia':
          contentType = 'trivia_source';
          break;
        case 'articles':
          contentType = 'story_source';
          break;
        case 'stats':
        case 'lore':
          contentType = 'news_source';
          break;
        case 'hugs':
          contentType = 'story_source';
          break;
        default:
          contentType = 'trivia_source';
      }

      const response = await fetch(
        `/api/sourced-text?contentType=${contentType}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setContentItems(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch content for category:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent =
      productionIcons[iconName as keyof typeof productionIcons] ||
      DocumentTextIcon;
    return <IconComponent className="h-6 w-6 text-white" />;
  };

  const formatTimeAgo = (dateString: string): string => {
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
  };

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Content Processing</h1>
      </div>

      {/* Categories Section */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What do you want to produce?
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {productionCategories.map(category => (
              <div
                key={category.id}
                className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`${category.color} rounded-lg p-2 flex-shrink-0`}
                    >
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Items Section - Only show when category is selected */}
      {selectedCategory && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Source Content for {selectedCategory.name}
              </h2>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setContentItems([]);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to Categories
              </button>
            </div>

            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : contentItems.length > 0 ? (
              <div className="space-y-3">
                {contentItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div
                            className={`${productionColors[selectedCategory.icon as keyof typeof productionColors]} rounded-md p-1.5 flex-shrink-0`}
                          >
                            {getCategoryIcon(selectedCategory.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {truncateText(item.original_text, 120)}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>{item.word_count} words</span>
                              <span>•</span>
                              <span>{formatTimeAgo(item.created_at)}</span>
                              <span>•</span>
                              <span className="capitalize">
                                {item.content_type.replace('_source', '')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="bg-blue-600 text-white text-xs py-1.5 px-3 rounded hover:bg-blue-700 transition-colors">
                          Select
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No content found for {selectedCategory.name}</p>
                <p className="text-sm">
                  Add some {selectedCategory.name.toLowerCase()} content to get
                  started
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
