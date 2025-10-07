'use client';

import { useState } from 'react';
import {
  processText,
  getInitialSteps,
  ProcessingStep,
  ProcessingResult,
} from '@/lib/text-processing';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function SourceAnalysis() {
  const [content, setContent] = useState('');
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState('');
  const [message, setMessage] = useState('');

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  const handleProcess = async () => {
    if (!content.trim()) {
      setMessage('Please enter some content to analyze.');
      return;
    }

    setIsProcessing(true);
    setMessage('Analyzing content...');
    setAnalysisResults('');

    try {
      // Initialize processing steps
      const steps = getInitialSteps();
      setProcessingSteps(steps);
      setCurrentStepIndex(0);

      // Process the text
      const result: ProcessingResult = await processText(content, steps);

      // Format analysis results
      const analysisText = `Content Analysis Summary:
- Word Count: ${result.wordCount}
- Processing Steps: ${result.steps.length}
- Processing Time: ${result.processingTime}ms

Processed Content:
${result.processedText}

Analysis Details:
${result.steps
  .map((step, index) => `${index + 1}. ${step.name}: ${step.description}`)
  .join('\n')}`;

      setAnalysisResults(analysisText);
      setMessage(
        `✅ Analysis complete! Processed ${result.wordCount} words in ${result.processingTime}ms`
      );
    } catch (error) {
      setMessage(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Source Analysis
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Analyze and process hockey content to understand its structure and
          quality.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleProcess}
              disabled={isProcessing || !content.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
            >
              {isProcessing ? 'Analyzing...' : 'Analyze Content'}
            </button>

            {content && (
              <button
                type="button"
                onClick={() => {
                  setContent('');
                  setAnalysisResults('');
                  setMessage('');
                  setProcessingSteps([]);
                  setCurrentStepIndex(0);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Analysis Results
            </label>
            <div className="mt-1 min-h-[300px] rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
              {analysisResults ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                  {analysisResults}
                </pre>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Analysis results will appear here after processing...
                </p>
              )}
            </div>
          </div>

          {/* Processing Steps */}
          {processingSteps.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Processing Steps
              </label>
              <div className="mt-1 space-y-2">
                {processingSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 rounded-md p-3 ${
                      index <= currentStepIndex
                        ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        index < currentStepIndex
                          ? 'bg-green-600 text-white'
                          : index === currentStepIndex
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          index <= currentStepIndex
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {step.name}
                      </p>
                      <p
                        className={`text-xs ${
                          index <= currentStepIndex
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-gray-500 dark:text-gray-500'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          How to use Source Analysis:
        </h3>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <ol className="list-decimal list-inside space-y-1">
            <li>Paste your hockey content in the text area</li>
            <li>Click &quot;Analyze Content&quot; to process the text</li>
            <li>Review the analysis results and processing steps</li>
            <li>Use the processed content for further content generation</li>
          </ol>
        </div>
        <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> This tool analyzes content structure and
          quality before AI content generation.
        </p>
      </div>
    </div>
  );
}
