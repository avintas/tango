'use client';

import { useState } from 'react';
import {
  processText,
  getInitialSteps,
  ProcessingStep,
  ProcessingResult,
} from '@/lib/text-processing';
import {
  generateContent,
  ContentType,
  ContentGenerationResult,
  testGeminiConnection,
} from '@/lib/gemini';
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
      const num = index + 1;

      switch (contentType) {
        case 'trivia_questions':
          return `${num}. ${item.question}
   ✓ ${item.correct_answer}
   ✗ ${item.incorrect_answers.join(', ')}
   Difficulty: ${item.difficulty} | Category: ${item.category}
   ${item.explanation ? `Explanation: ${item.explanation}` : ''}`;

        case 'factoids':
          return `${num}. ${item.fact}
   Category: ${item.category} | Difficulty: ${item.difficulty}
   ${item.source ? `Source: ${item.source}` : ''}`;

        case 'quotes':
          return `${num}. "${item.quote}"
   - ${item.speaker}
   ${item.context ? `Context: ${item.context}` : ''}
   Category: ${item.category}`;

        case 'statistics':
          return `${num}. ${item.statistic}: ${item.value}
   Context: ${item.context}
   Category: ${item.category}`;

        case 'stories':
          return `${num}. ${item.title}
   ${item.story}
   Category: ${item.category}
   Key Points: ${item.key_points.join(', ')}`;

        case 'rules':
          return `${num}. ${item.rule}
   ${item.explanation}
   Examples: ${item.examples.join(', ')}
   Category: ${item.category}`;

        case 'achievements':
          return `${num}. ${item.achievement}
   By: ${item.player_or_team}${item.year ? ` (${item.year})` : ''}
   Context: ${item.context}
   Category: ${item.category}`;

        case 'history':
          return `${num}. ${item.event} (${item.date})
   Significance: ${item.significance}
   Details: ${item.details}
   Category: ${item.category}`;

        default:
          return `${num}. ${JSON.stringify(item, null, 2)}`;
      }
    })
    .join('\n\n');
}

export default function SourceCreator() {
  const [content, setContent] = useState('');
  const [analysisResults, setAnalysisResults] = useState('');
  const [contentType, setContentType] =
    useState<ContentType>('trivia_questions');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false);
  const [message, setMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [processingSteps, setProcessingSteps] =
    useState<ProcessingStep[]>(getInitialSteps());
  const [processingResult, setProcessingResult] =
    useState<ProcessingResult | null>(null);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<string>('');

  const handleProcess = async () => {
    if (!content.trim()) {
      setMessage('Please enter some content to process.');
      return;
    }

    setIsProcessing(true);
    setMessage('Starting content generation...');
    setProcessingSteps(getInitialSteps());
    setProcessingResult(null);

    try {
      // First, clean the text locally
      const textResult = await processText(content);
      setProcessingResult(textResult);
      setContent(textResult.processedText);
      setProcessingSteps(textResult.steps);

      // Move cleaned text to Analysis Panel
      setAnalysisResults(textResult.processedText);

      // If we have a saved record, update it with processed content
      if (savedRecordId) {
        try {
          const updateResponse = await fetch(
            `/api/source-content/${savedRecordId}/process`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                processed_text: textResult.processedText,
                word_count: textResult.wordCount,
                processing_time_ms: textResult.processingTime,
              }),
            }
          );

          const updateResult = await updateResponse.json();
          if (updateResult.success) {
            setMessage(`✅ Content processed and moved to Analysis Panel!`);
          }
        } catch (updateError) {
          console.error('Failed to update database:', updateError);
          // Continue with local processing even if DB update fails
        }
      }

      setMessage(`✅ Content processed and ready for AI generation!`);
    } catch (error) {
      setMessage(
        `❌ Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      setMessage('Please enter some content to save.');
      return;
    }

    setIsPosting(true);
    setMessage('Saving source content...');

    try {
      // Use API route to save to source_content table
      const response = await fetch('/api/source-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_text: content.trim(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save content');
      }

      setMessage(
        `✅ Source content saved successfully! (ID: ${result.data.id})`
      );
      setSaveSuccess(true);
      setSavedRecordId(result.data.id); // Store the record ID for processing
      // Keep content in textarea for processing

      // Hide success checkmark after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setMessage(
        `❌ Error saving content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsPosting(false);
    }
  };

  const clearContent = () => {
    setContent('');
    setMessage('');
    setSaveSuccess(false);
    setProcessingSteps(getInitialSteps());
    setProcessingResult(null);
    setAnalysisResults('');
    setContentType('trivia_questions');
    setSavedRecordId(null);
    setIsGenerating(false);
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResults.trim()) {
      setMessage('Please add some analysis results to save.');
      return;
    }

    setIsSavingAnalysis(true);
    setMessage('Saving analysis results...');

    try {
      // Use API route to save analysis results
      const response = await fetch('/api/source-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_text: analysisResults.trim(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save analysis');
      }

      setMessage(
        `✅ Analysis results saved successfully! (ID: ${result.data.id})`
      );
    } catch (error) {
      setMessage(
        `❌ Error saving analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSavingAnalysis(false);
    }
  };

  const clearAnalysisResults = () => {
    setAnalysisResults('');
    setMessage('');
  };

  const handleGenerateContent = async () => {
    if (!analysisResults.trim()) {
      setMessage(
        'Please process content first or add some text to the Analysis Panel.'
      );
      return;
    }

    setIsGenerating(true);
    setMessage('Generating content with Gemini...');

    try {
      console.log('Starting Gemini generation...');
      console.log('Content type:', contentType);
      console.log('Analysis results length:', analysisResults.trim().length);

      const contentTypeLabel =
        contentTypes.find(ct => ct.value === contentType)?.label || contentType;

      console.log('Gemini API is disabled - skipping content generation');
      const geminiResult = {
        success: false,
        content: [],
        contentType,
        error: 'Gemini API is not available - API key not configured',
        processingTime: 0,
      };

      console.log('Gemini result:', geminiResult);

      if (geminiResult.success) {
        console.log('Gemini generation successful!');
        // Format the generated content for display
        const formattedContent = formatGeneratedContent(
          geminiResult.content,
          contentType
        );

        const analysisText = `Content Generation Summary:
- Content Type: ${contentTypeLabel}
- Generated Items: ${geminiResult.content.length}
- Processing Time: ${geminiResult.processingTime}ms

Generated ${contentTypeLabel}:
${formattedContent}`;

        setAnalysisResults(analysisText);
        setMessage(
          `✅ Generated ${geminiResult.content.length} ${contentTypeLabel.toLowerCase()} in ${geminiResult.processingTime}ms`
        );
      } else {
        console.error('Gemini generation failed:', geminiResult.error);
        throw new Error(geminiResult.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setMessage(
        `❌ Generation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const testGemini = async () => {
    setGeminiStatus('Gemini API is disabled - no API key configured');
  };

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
  const charCount = content.length;
  const isLongContent = wordCount > 1000;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Source Creator
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Capture raw text content, process it, and generate AI content.
              Paste your source material, clean it, then create specialized
              content for Onlyhockey.com.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Words: {wordCount}</span>
            <span>Characters: {charCount}</span>
            {isLongContent && (
              <span className="text-yellow-600 font-medium">
                ⚠️ Long content detected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Source Content */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Source Content
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Words: {wordCount}</span>
                <span>Characters: {charCount}</span>
                {isLongContent && (
                  <span className="text-yellow-600 font-medium">⚠️ Long</span>
                )}
              </div>
            </div>

            {/* Text Area */}
            <div className="mb-4">
              <textarea
                id="content"
                name="content"
                rows={16}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm/6 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                placeholder="Paste your source content here... This will be saved as raw material for trivia games."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handlePost}
                disabled={isProcessing || isPosting || !content.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPosting && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {saveSuccess && (
                  <svg
                    className="mr-2 h-4 w-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isPosting
                  ? 'Saving...'
                  : saveSuccess
                    ? 'Saved!'
                    : 'Save Source'}
              </button>

              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing || isPosting || !content.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {isProcessing ? 'Processing...' : 'Process'}
              </button>

              <button
                type="button"
                onClick={clearContent}
                disabled={isProcessing || isPosting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Processing Steps - Always visible */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Processing Steps
              </h4>
              <div className="space-y-1">
                {processingSteps.map(step => (
                  <div key={step.id} className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-500'
                          : step.processing
                            ? 'bg-yellow-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      {step.completed && (
                        <svg
                          className="w-2 h-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {step.processing && (
                        <svg
                          className="w-2 h-2 text-white animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {step.name}
                    </div>
                  </div>
                ))}

                {/* Record inserted acknowledgement step */}
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center ${
                      saveSuccess
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    {saveSuccess && (
                      <svg
                        className="w-2 h-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Record inserted acknowledgement
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Analysis Results */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analysis Results
              </h2>
              <div className="text-xs text-gray-500">
                {analysisResults.length} chars
              </div>
            </div>

            {/* Content Type Selector */}
            <div className="mb-4">
              <label
                htmlFor="contentType"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                Content Type
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="contentType"
                  name="contentType"
                  value={contentType}
                  onChange={e => setContentType(e.target.value as ContentType)}
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-gray-800 dark:text-white dark:outline-gray-600 dark:focus-visible:outline-indigo-500"
                >
                  {contentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
              </div>
            </div>

            {/* Editable Analysis Results */}
            <div className="flex-1 mb-4">
              <textarea
                id="analysisResults"
                name="analysisResults"
                rows={12}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                placeholder="Analysis results will appear here after processing. You can edit and refine the content before saving."
                value={analysisResults}
                onChange={e => setAnalysisResults(e.target.value)}
              />
            </div>

            {/* Gemini Status */}
            {geminiStatus && (
              <div className="mb-4 p-2 text-xs rounded bg-gray-100 dark:bg-gray-800">
                {geminiStatus}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={testGemini}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Test Gemini
              </button>

              <button
                type="button"
                onClick={handleGenerateContent}
                disabled={isGenerating || !analysisResults.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {isGenerating ? 'Generating...' : 'Generate Content'}
              </button>

              <button
                type="button"
                onClick={handleSaveAnalysis}
                disabled={isSavingAnalysis || !analysisResults.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingAnalysis && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {isSavingAnalysis ? 'Saving...' : 'Save Analysis'}
              </button>

              <button
                type="button"
                onClick={clearAnalysisResults}
                disabled={
                  isSavingAnalysis || isGenerating || !analysisResults.trim()
                }
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Results
              </button>
            </div>

            {/* Status Message */}
            {message && (
              <div
                className={`mt-4 p-3 rounded-md text-xs ${
                  message.includes('✅')
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : message.includes('❌')
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
          How to Use Source Creator
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <p>Copy text from any source (articles, books, websites, etc.)</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <p>
              Select the content type you want to generate (trivia, factoids,
              quotes, etc.)
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <p>Paste the content into the Source Content area</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              4
            </span>
            <p>
              Click &quot;Process&quot; to clean text and move it to Analysis
              Panel
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              5
            </span>
            <p>Select Content Type in the Analysis Panel</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              6
            </span>
            <p>
              Click &quot;Generate Content&quot; to create AI content with
              Gemini
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              7
            </span>
            <p>
              Click &quot;Save Analysis&quot; to store generated content, or
              &quot;Save Source&quot; for raw content
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/50 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Content Types:</strong> Choose from trivia questions,
            factoids, quotes, statistics, stories, rules, achievements, or
            historical content based on your needs.
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            <strong>AI Generation:</strong> Gemini AI will create specialized
            content based on your selected type, with proper formatting and
            categorization for Onlyhockey.com.
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            <strong>Editable Results:</strong> Review and refine generated
            content before saving to ensure quality and accuracy for your trivia
            games and content library.
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            <strong>Content Length:</strong> Focused content (under 1000 words)
            works best for AI generation. You can always create multiple source
            items for longer topics.
          </p>
        </div>
      </div>
    </div>
  );
}
