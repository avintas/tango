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
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
    setGeneratedItems([]);

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
      if (!Array.isArray(result.content)) {
        throw new Error('Expected array of items from Gemini API');
      }

      // Store the generated items (don't save yet - let user choose)
      setGeneratedItems(result.content);

      // Show combined preview for user
      const markdownOutput = result.content
        .map(
          (item: any, index: number) =>
            `## Item ${index + 1}\n\n${JSON.stringify(item, null, 2)}`
        )
        .join('\n\n---\n\n');
      setGeneratedContent(markdownOutput);
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to generate title from item
  const generateItemTitle = (item: any, index: number) => {
    if (item.question) {
      return item.question.substring(0, 100);
    } else if (item.statistic) {
      return item.statistic.substring(0, 100);
    } else if (item.quote) {
      return `${item.speaker}: ${item.quote.substring(0, 80)}`;
    } else if (item.title) {
      return item.title;
    } else if (item.fact) {
      return item.fact.substring(0, 100);
    } else {
      return `${selectedCategory?.name} - Item ${index + 1}`;
    }
  };

  // Save as a single bundled set
  const handleSaveAsBundle = async () => {
    if (!selectedCategory || generatedItems.length === 0) return;

    setIsSaving(true);

    try {
      // Create a comprehensive markdown document with all items
      const bundleTitle = `${selectedCategory.name} Set - ${new Date().toLocaleDateString()}`;
      const markdownContent = JSON.stringify(generatedItems, null, 2);

      const response = await fetch('/api/content-processed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          title: bundleTitle,
          content_type: selectedCategory.id,
          markdown_content: markdownContent,
          status: 'draft',
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Saved as single set!\n\nTitle: ${bundleTitle}\nItems: ${generatedItems.length}\nStatus: Draft`
        );
        // Clear generated content after successful save
        setGeneratedItems([]);
        setGeneratedContent('');
      } else {
        throw new Error(result.error || 'Failed to save bundle');
      }
    } catch (error) {
      console.error('Save bundle error:', error);
      alert(
        `❌ Failed to save bundle:\n${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Save as separate individual items
  const handleSaveAsSeparate = async () => {
    if (!selectedCategory || generatedItems.length === 0) return;

    setIsSaving(true);

    try {
      let savedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < generatedItems.length; i++) {
        const item = generatedItems[i];
        const itemTitle = generateItemTitle(item, i + 1);
        const markdownContent = JSON.stringify(item, null, 2);

        try {
          const response = await fetch('/api/content-processed', {
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

          const result = await response.json();

          if (result.success) {
            savedCount++;
          } else {
            errors.push(`Item ${i + 1}: ${result.error}`);
          }
        } catch (error) {
          errors.push(
            `Item ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      if (errors.length === 0) {
        alert(
          `✅ Saved ${savedCount} separate items!\n\nType: ${selectedCategory.id}\nStatus: Draft`
        );
        // Clear generated content after successful save
        setGeneratedItems([]);
        setGeneratedContent('');
      } else {
        alert(
          `⚠️ Saved ${savedCount} of ${generatedItems.length} items.\n\nErrors:\n${errors.join('\n')}`
        );
      }
    } catch (error) {
      console.error('Save separate error:', error);
      alert(
        `❌ Failed to save items:\n${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSaving(false);
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

          {/* Generated Content Display with Save Options */}
          {generatedContent && (
            <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    ✅ Generated {generatedItems.length} Items
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Choose how to save this content
                  </p>
                </div>
                <button
                  onClick={() => {
                    setGeneratedContent('');
                    setGeneratedItems([]);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  Dismiss
                </button>
              </div>

              {/* Save Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <button
                  onClick={handleSaveAsBundle}
                  disabled={isSaving}
                  className="flex flex-col items-start p-4 bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <svg
                        className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Save as Single Set
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        1 record • Perfect for &ldquo;Daily Quiz&rdquo;
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
                    Bundle all {generatedItems.length} items together as one
                    cohesive set. Great for publishing a complete trivia game.
                  </p>
                </button>

                <button
                  onClick={handleSaveAsSeparate}
                  disabled={isSaving}
                  className="flex flex-col items-start p-4 bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-600 rounded-lg hover:border-green-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg
                        className="w-5 h-5 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Save as {generatedItems.length} Separate Items
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {generatedItems.length} records • Flexible mixing
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
                    Save each item individually. Perfect for building a content
                    bank or cherry-picking the best questions.
                  </p>
                </button>
              </div>

              {/* Preview */}
              <details className="mt-4">
                <summary className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer hover:underline font-medium">
                  📄 Preview generated content (click to expand)
                </summary>
                <pre className="mt-3 text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
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
