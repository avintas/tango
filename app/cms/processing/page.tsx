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

export default function ProcessingPage() {
  const { session } = useAuth();
  const [productionCategories, setProductionCategories] = useState<
    ProductionCategory[]
  >([]);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductionCategory | null>(null);
  const [promptContent, setPromptContent] = useState<string>('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [sourceContent, setSourceContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generationError, setGenerationError] = useState<string>('');

  // Production category icons mapping
  const productionIcons = {
    trivia: ChartBarIcon,
    quotes: UserGroupIcon,
    stats: DocumentTextIcon,
    articles: BookOpenIcon,
    lore: SparklesIcon,
    hugs: HeartIcon,
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
    setPromptLoading(true);

    // Load the prompt for this category
    try {
      const promptResponse = await fetch(
        `/prompts/processing/${category.id}.md`
      );
      if (promptResponse.ok) {
        const promptText = await promptResponse.text();
        setPromptContent(promptText);
      }
    } catch (error) {
      console.error('Failed to load prompt:', error);
      setPromptContent('');
    } finally {
      setPromptLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent =
      productionIcons[iconName as keyof typeof productionIcons] ||
      DocumentTextIcon;
    return <IconComponent className="h-6 w-6 text-white" />;
  };

  // Map category IDs to Gemini content types
  const categoryToGeminiType: { [key: string]: string } = {
    trivia: 'trivia_questions',
    quotes: 'quotes',
    stats: 'statistics',
    articles: 'stories',
    lore: 'history',
    hugs: 'factoids',
  };

  const handleGenerate = async () => {
    if (!selectedCategory || !sourceContent) return;

    setIsGenerating(true);
    setGenerationError('');
    setGeneratedContent('');

    try {
      // Map category ID to Gemini content type
      const geminiContentType =
        categoryToGeminiType[selectedCategory.id] || selectedCategory.id;

      // Call Gemini API with source content and content type
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          content: sourceContent,
          contentType: geminiContentType,
          numItems: 5,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      // The result.content is an array of generated items
      // Save each item as a separate record
      if (!Array.isArray(result.content)) {
        throw new Error('Expected array of items from Gemini API');
      }

      let savedCount = 0;
      const errors: string[] = [];

      // Save each item individually
      for (let i = 0; i < result.content.length; i++) {
        const item = result.content[i];

        // Convert item to markdown format
        const markdownContent = JSON.stringify(item, null, 2);

        // Generate title based on content type and item content
        let itemTitle = '';
        if (item.question) {
          // Trivia question
          itemTitle = item.question.substring(0, 100);
        } else if (item.statistic) {
          // Statistic
          itemTitle = item.statistic.substring(0, 100);
        } else if (item.quote) {
          // Quote
          itemTitle = `${item.speaker}: ${item.quote.substring(0, 80)}`;
        } else if (item.title) {
          // Story or other content with title
          itemTitle = item.title;
        } else if (item.fact) {
          // Factoid
          itemTitle = item.fact.substring(0, 100);
        } else {
          // Fallback
          itemTitle = `${selectedCategory.name} - Item ${i + 1}`;
        }

        try {
          const saveResponse = await fetch('/api/content-processed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              title: itemTitle,
              content_type: selectedCategory.id,
              markdown_content: markdownContent,
              status: 'draft',
            }),
          });

          const saveResult = await saveResponse.json();

          if (saveResult.success) {
            savedCount++;
          } else {
            errors.push(`Item ${i + 1}: ${saveResult.error}`);
          }
        } catch (error) {
          errors.push(
            `Item ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Show combined preview for user
      const markdownOutput = result.content
        .map(
          (item: any, index: number) =>
            `## Item ${index + 1}\n\n${JSON.stringify(item, null, 2)}`
        )
        .join('\n\n---\n\n');
      setGeneratedContent(markdownOutput);

      // Display success/error message
      if (errors.length === 0) {
        alert(
          `✅ Successfully generated and saved ${savedCount} items!\n\nType: ${selectedCategory.id}\nEach item is now a separate record.`
        );
      } else {
        alert(
          `⚠️ Saved ${savedCount} of ${result.content.length} items.\n\nErrors:\n${errors.join('\n')}`
        );
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsGenerating(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Content Processing</h1>
      </div>

      {/* Categories Section */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
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
                      <h3 className="text-xs font-medium text-gray-900 truncate">
                        {category.name}
                      </h3>
                      <p className="text-[11px] text-gray-500">
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

      {/* Prompt Display Section - Always show when category is selected */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-indigo-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {selectedCategory
                ? `AI Prompt for ${selectedCategory.name}`
                : 'AI Prompt'}
            </h2>
            {selectedCategory && (
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  prompts/processing/{selectedCategory.id}.md
                </span>
              </div>
            )}
          </div>

          {!selectedCategory ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500">
              <p className="text-sm">
                Select a category above to load its prompt
              </p>
            </div>
          ) : promptLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : promptContent ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 max-h-[120px] overflow-y-auto">
              <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
                {promptContent}
              </pre>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500">
              <p className="text-sm">No prompt available for this category</p>
            </div>
          )}

          {selectedCategory && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                This prompt will be used to process the source content below
                with AI
              </p>
              <button className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
                Edit Prompt →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Source Content Input Section - Always show */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {selectedCategory
                  ? `Source Content for ${selectedCategory.name}`
                  : 'Source Content'}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Paste processed content from the sourcing page
              </p>
            </div>
            {sourceContent && (
              <button
                onClick={() => setSourceContent('')}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Clear
              </button>
            )}
          </div>

          <textarea
            value={sourceContent}
            onChange={e => setSourceContent(e.target.value)}
            placeholder="Paste your processed content here..."
            className="w-full min-h-[300px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[11px] text-gray-600 dark:text-gray-400">
              {sourceContent ? (
                <>
                  <span className="font-medium">
                    {sourceContent.split(/\s+/).filter(Boolean).length}
                  </span>{' '}
                  words
                  <span className="mx-2">•</span>
                  <span className="font-medium">
                    {sourceContent.length}
                  </span>{' '}
                  characters
                </>
              ) : (
                <span>No content added yet</span>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!selectedCategory || !sourceContent || isGenerating}
              className="bg-indigo-600 text-white text-xs font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>

          {/* Error Display */}
          {generationError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Error:</strong> {generationError}
              </p>
            </div>
          )}

          {/* Generated Content Display */}
          {generatedContent && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                  ✅ Content Generated & Saved as Draft
                </p>
                <button
                  onClick={() => setGeneratedContent('')}
                  className="text-xs text-green-600 hover:text-green-700 dark:text-green-400"
                >
                  Dismiss
                </button>
              </div>
              <details className="mt-2">
                <summary className="text-xs text-green-700 dark:text-green-300 cursor-pointer hover:underline">
                  Preview markdown (click to expand)
                </summary>
                <pre className="mt-2 text-xs text-green-800 dark:text-green-200 bg-white dark:bg-gray-800 p-3 rounded border border-green-200 dark:border-green-700 overflow-x-auto whitespace-pre-wrap">
                  {generatedContent}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
