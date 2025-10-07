'use client';

import { useState, useMemo } from 'react';
import { ContentType, ContentGenerationResult } from '@/lib/gemini';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const contentTypes: {
  value: ContentType;
  label: string;
  description: string;
}[] = [
  {
    value: 'trivia_questions',
    label: 'Trivia Questions',
    description: 'Interactive Q&A for games',
  },
  {
    value: 'factoids',
    label: 'Factoids',
    description: 'Quick, interesting facts',
  },
  {
    value: 'quotes',
    label: 'Quotes',
    description: 'Player/coach motivational quotes',
  },
  { value: 'statistics', label: 'Statistics', description: 'Data and numbers' },
  { value: 'stories', label: 'Stories', description: 'Narrative content' },
  { value: 'rules', label: 'Rules', description: 'Rule explanations' },
  {
    value: 'achievements',
    label: 'Achievements',
    description: 'Player/team accomplishments',
  },
  { value: 'history', label: 'History', description: 'Historical content' },
];

// Helper function to format generated content for display
function formatGeneratedContent(
  content: any[],
  contentType: ContentType
): string {
  return content
    .map((item, index) => {
      switch (contentType) {
        case 'trivia_questions':
          return `Question ${index + 1}: ${item.question}
Correct Answer: ${item.correct_answer}
Incorrect Answers: ${item.incorrect_answers.join(', ')}
Difficulty: ${item.difficulty}
Category: ${item.category}
   ${item.explanation ? `Explanation: ${item.explanation}` : ''}`;
        case 'factoids':
          return `Fact ${index + 1}: ${item.fact}
Category: ${item.category}
Difficulty: ${item.difficulty}
   ${item.source ? `Source: ${item.source}` : ''}`;
        case 'quotes':
          return `Quote ${index + 1}: &quot;${item.quote}&quot;
Speaker: ${item.speaker}
   ${item.context ? `Context: ${item.context}` : ''}
   Category: ${item.category}`;
        case 'statistics':
          return `Stat ${index + 1}: ${item.statistic}
Value: ${item.value}
   Context: ${item.context}
   Category: ${item.category}`;
        case 'stories':
          return `Story ${index + 1}: ${item.title}
   ${item.story}
   Category: ${item.category}
   Key Points: ${item.key_points.join(', ')}`;
        case 'rules':
          return `Rule ${index + 1}: ${item.rule}
Explanation: ${item.explanation}
   Examples: ${item.examples.join(', ')}
   Category: ${item.category}`;
        case 'achievements':
          return `Achievement ${index + 1}: ${item.achievement}
Player/Team: ${item.player_or_team}
${item.year ? `Year: ${item.year}` : ''}
   Context: ${item.context}
   Category: ${item.category}`;
        case 'history':
          return `Event ${index + 1}: ${item.event}
Date: ${item.date}
   Significance: ${item.significance}
   Details: ${item.details}
   Category: ${item.category}`;
        default:
          return `Item ${index + 1}: ${JSON.stringify(item, null, 2)}`;
      }
    })
    .join('\n\n');
}

// Utility function for consistent error handling
const handleError = (error: unknown, defaultMessage: string): string => {
  return error instanceof Error ? error.message : defaultMessage;
};

export default function SourceCreator() {
  const [content, setContent] = useState('');
  const [contentType, setContentType] =
    useState<ContentType>('trivia_questions');
  const [numItems, setNumItems] = useState(5);

  // Consolidated state objects for better organization
  const [generationState, setGenerationState] = useState({
    isGenerating: false,
    message: '',
    content: '',
  });

  const [saveState, setSaveState] = useState({
    isSaving: false,
    status: '',
  });

  const [geminiStatus, setGeminiStatus] = useState<string>('');

  // Memoized word count calculation for performance
  const wordCount = useMemo(() => {
    return content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }, [content]);

  const testGemini = async () => {
    setGeminiStatus('Testing Gemini API...');

    try {
      const response = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setGeminiStatus('✅ Gemini API is working!');
      } else {
        setGeminiStatus(`❌ ${handleError(result.error, 'Test failed')}`);
      }
    } catch (error) {
      setGeminiStatus(`❌ Error: ${handleError(error, 'Unknown error')}`);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setSaveState({
        isSaving: false,
        status: '❌ Please enter some content to save.',
      });
      return;
    }

    setSaveState({ isSaving: true, status: 'Saving to Supabase...' });

    try {
      const response = await fetch('/api/source-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          contentType: contentType,
          wordCount: wordCount,
          characterCount: content.length,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveState({
          isSaving: false,
          status: '✅ Content saved successfully to Supabase!',
        });
        // Clear the status message after 3 seconds
        setTimeout(() => setSaveState({ isSaving: false, status: '' }), 3000);
      } else {
        setSaveState({
          isSaving: false,
          status: `❌ Save failed: ${handleError(result.error, 'Unknown error')}`,
        });
      }
    } catch (error) {
      setSaveState({
        isSaving: false,
        status: `❌ Error: ${handleError(error, 'Unknown error')}`,
      });
    }
  };

  const handleGenerate = async () => {
    if (!content.trim()) {
      setGenerationState({
        isGenerating: false,
        message: 'Please enter some content to generate from.',
        content: '',
      });
      return;
    }

    setGenerationState({
      isGenerating: true,
      message: 'Generating content with Gemini...',
      content: '',
    });

    try {
      console.log('Starting Gemini generation...');
      console.log('Content type:', contentType);
      console.log('Content length:', content.trim().length);

      const contentTypeLabel =
        contentTypes.find(ct => ct.value === contentType)?.label || contentType;

      // Call the API route for content generation
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          contentType: contentType,
          numItems: numItems,
        }),
      });

      const geminiResult = await response.json();

      console.log('Gemini result:', geminiResult);

      if (geminiResult.success) {
        console.log('Gemini generation successful!');
        // Format the generated content for display
        const formattedContent = formatGeneratedContent(
          geminiResult.content,
          contentType
        );

        const successMessage = `✅ Generated ${geminiResult.content.length} ${contentTypeLabel.toLowerCase()} in ${geminiResult.processingTime}ms`;
        setGenerationState({
          isGenerating: false,
          message: successMessage,
          content: formattedContent,
        });
      } else {
        console.error('Gemini generation failed:', geminiResult.error);
        throw new Error(geminiResult.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Content generation error:', error);
      setGenerationState({
        isGenerating: false,
        message: `❌ Error: ${handleError(error, 'Unknown error')}`,
        content: '',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Source Creator
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create structured hockey content using AI. Paste your source material
          and select the content type you want to generate.
        </p>
      </div>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Top-Left: Source Content Panel */}
        <div className="flex flex-col space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Source Content
            </h3>

            {/* Content Type Selection */}
            <div className="mb-4">
              <label
                htmlFor="content-type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Content Type
              </label>
              <select
                id="content-type"
                value={contentType}
                onChange={e => setContentType(e.target.value as ContentType)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                aria-label="Select content type for generation"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Items */}
            <div className="mb-4">
              <label
                htmlFor="num-items"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Number of Items
              </label>
              <input
                id="num-items"
                type="number"
                min="1"
                max="20"
                value={numItems}
                onChange={e => setNumItems(parseInt(e.target.value) || 5)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                aria-label="Number of items to generate"
              />
            </div>

            {/* Text Area */}
            <div className="flex-1 mb-4">
              <textarea
                id="content"
                className="w-full h-full min-h-[200px] rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
                placeholder=""
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saveState.isSaving || !content.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveState.isSaving ? 'SAVING...' : 'SAVE'}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generationState.isGenerating || !content.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generationState.isGenerating ? 'Generating...' : 'PROCESS'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setContent('');
                  setGenerationState({
                    isGenerating: false,
                    message: '',
                    content: '',
                  });
                  setSaveState({ isSaving: false, status: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                CLEAR
              </button>
            </div>
          </div>
        </div>

        {/* Top-Right: Instructions Panel */}
        <div className="flex flex-col">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              INSTRUCTIONS
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Paste your hockey content in the text area
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Select the content type you want to generate
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Click PROCESS to generate structured content
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Review and use the generated content
                </p>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 h-32 overflow-y-auto">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">
                  <strong>Content Types:</strong>
                </p>
                <ul className="space-y-1 text-xs">
                  <li>• Trivia Questions - Interactive Q&A for games</li>
                  <li>• Factoids - Quick, interesting facts</li>
                  <li>• Quotes - Player/coach motivational quotes</li>
                  <li>• Statistics - Data and numbers</li>
                  <li>• Stories - Narrative content</li>
                  <li>• Rules - Rule explanations</li>
                  <li>• Achievements - Player/team accomplishments</li>
                  <li>• History - Historical content</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Left: Processing Monitor */}
        <div className="flex flex-col">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Processing Monitor
            </h3>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 h-full overflow-y-auto">
              {saveState.isSaving ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Saving to Supabase...
                    </span>
                  </div>
                </div>
              ) : saveState.status ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {saveState.status}
                    </span>
                  </div>
                </div>
              ) : generationState.isGenerating ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Connecting to Gemini API...
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Processing content...
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Generating {contentType.replace('_', ' ')}...
                    </span>
                  </div>
                </div>
              ) : generationState.content ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Content generated successfully!
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {generationState.message}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Processing status will appear here when you click SAVE or
                  PROCESS...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom-Right: Stats Panel */}
        <div className="flex flex-col">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              STATS
            </h3>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 h-full">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Words:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {wordCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Characters:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {content.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Content Type:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {contentTypes.find(ct => ct.value === contentType)?.label}
                  </span>
                </div>
                {generationState.content && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Generated Items:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {
                          generationState.content
                            .split('\n\n')
                            .filter(item => item.trim()).length
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Content - Full Width Below Grid */}
      {generationState.content && (
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Generated Content
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                {generationState.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
