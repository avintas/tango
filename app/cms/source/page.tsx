'use client';

import { useState } from 'react';
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

export default function SourceCreator() {
  const [content, setContent] = useState('');
  const [contentType, setContentType] =
    useState<ContentType>('trivia_questions');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [message, setMessage] = useState('');
  const [geminiStatus, setGeminiStatus] = useState<string>('');

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
        setGeminiStatus(`❌ ${result.error || 'Test failed'}`);
      }
    } catch (error) {
      setGeminiStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleGenerate = async () => {
    if (!content.trim()) {
      setMessage('Please enter some content to generate from.');
      return;
    }

    setIsGenerating(true);
    setMessage('Generating content with Gemini...');

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
          numItems: 5,
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

        setGeneratedContent(formattedContent);
        const summaryText = `Content Generation Summary:
- Content Type: ${contentTypeLabel}
- Generated Items: ${geminiResult.content.length}
- Processing Time: ${geminiResult.processingTime}ms

Generated ${contentTypeLabel}:
${formattedContent}`;

        setMessage(
          `✅ Generated ${geminiResult.content.length} ${contentTypeLabel.toLowerCase()} in ${geminiResult.processingTime}ms`
        );
      } else {
        console.error('Gemini generation failed:', geminiResult.error);
        throw new Error(geminiResult.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Content generation error:', error);
      setMessage(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

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

      <div className="space-y-6">
        {/* Content Input */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Hockey Content
            </label>
            <textarea
              id="content"
              rows={12}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              placeholder="Paste your hockey content here (articles, stats, stories, etc.)..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{wordCount} words</span>
              <span>{content.length} characters</span>
            </div>
          </div>

          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content Type
            </label>
            <div className="mt-1">
              <select
                value={contentType}
                onChange={e => setContentType(e.target.value as ContentType)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !content.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>

            <button
              type="button"
              onClick={testGemini}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
            >
              Test Gemini
            </button>

            {content && (
              <button
                type="button"
                onClick={() => {
                  setContent('');
                  setGeneratedContent('');
                  setMessage('');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Gemini Status */}
          {geminiStatus && (
            <div className="mb-4 p-2 text-xs rounded bg-gray-100 dark:bg-gray-800">
              {geminiStatus}
            </div>
          )}
        </div>

        {/* Generated Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Generated Content
            </label>
            <div className="mt-1 min-h-[400px] rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
              {generatedContent ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                  {generatedContent}
                </pre>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generated content will appear here...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          How to use Source Creator:
        </h3>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <ol className="list-decimal list-inside space-y-1">
            <li>Paste your hockey content in the text area</li>
            <li>Select the type of content you want to generate</li>
            <li>
              Click &quot;Generate Content&quot; to create structured content
              with AI
            </li>
            <li>Review and use the generated content</li>
          </ol>
        </div>
        <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
          <strong>Single Action Principle:</strong> One form, one action, one
          focus - create structured content directly from your source material.
        </p>
      </div>
    </div>
  );
}
