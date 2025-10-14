'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { processText, ProcessingStep } from '@/lib/text-processing';

export default function SourcingPage() {
  const [content, setContent] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [processedChunks, setProcessedChunks] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [isOriginalCollapsed, setIsOriginalCollapsed] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const { session } = useAuth();

  // Calculate content statistics
  const getContentStats = (text: string) => {
    if (!text.trim()) {
      return {
        words: 0,
        chars: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        avgWordsPerSentence: 0,
      };
    }

    const words = text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    const chars = text.length;
    const sentences = text
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 0).length;
    const paragraphs = text
      .split(/\n\n+/)
      .filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    const avgWordsPerSentence =
      sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;

    return {
      words,
      chars,
      sentences,
      paragraphs,
      readingTime,
      avgWordsPerSentence,
    };
  };

  const contentStats = getContentStats(content);

  const handleProcess = async () => {
    if (!content.trim()) {
      setSaveStatus('❌ Please enter some content to process.');
      return;
    }

    setIsProcessing(true);
    setSaveStatus('Processing content...');
    setProcessingSteps([]);

    try {
      const result = await processText(content);
      setProcessedContent(result.processedText);
      setProcessedChunks(result.chunks);
      setProcessingSteps(result.steps);

      const chunkInfo =
        result.chunks.length > 1
          ? ` Split into ${result.chunks.length} chunks.`
          : '';
      setSaveStatus(
        `✅ Processing complete! ${result.steps.length} steps applied in ${result.processingTime}ms.${chunkInfo}`
      );
    } catch (error) {
      setSaveStatus(
        `❌ Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!processedContent?.trim()) {
      setSaveStatus('❌ Please process content before saving.');
      return;
    }

    setIsSaving(true);
    setSaveStatus(
      `Saving ${processedChunks.length} chunk${processedChunks.length > 1 ? 's' : ''} to Supabase...`
    );

    try {
      // Save each chunk as a separate record
      const savePromises = processedChunks.map(async chunk => {
        const chunkWordCount = chunk
          .trim()
          .split(/\s+/)
          .filter(word => word.length > 0).length;

        return fetch('/api/content-source', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            processed_content: chunk.trim(),
            word_count: chunkWordCount,
            char_count: chunk.length,
          }),
        });
      });

      const responses = await Promise.all(savePromises);
      const results = await Promise.all(responses.map(r => r.json()));

      const allSuccessful = results.every(r => r.success);

      if (allSuccessful) {
        setSaveStatus(
          `✅ ${processedChunks.length} chunk${processedChunks.length > 1 ? 's' : ''} saved successfully!`
        );
        // Clear content after successful save
        setTimeout(() => {
          setContent('');
          setProcessedContent('');
          setProcessedChunks([]);
        }, 2000);
      } else {
        const failedCount = results.filter(r => !r.success).length;
        setSaveStatus(
          `❌ ${failedCount} chunk${failedCount > 1 ? 's' : ''} failed to save.`
        );
      }
    } catch (error) {
      setSaveStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!processedContent) return;

    try {
      await navigator.clipboard.writeText(processedContent);
      setCopyStatus('✅ Copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (error) {
      setCopyStatus('❌ Failed to copy');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Content Sourcing
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Paste content to save and process
        </p>
      </div>

      {/* Content Sourcing Container */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 shadow-sm p-6">
          {/* Content Text Area */}
          <div className="mb-6">
            <div className="mb-2">
              <label
                htmlFor="content"
                className="block text-sm text-gray-700 dark:text-gray-300"
              >
                Source Content
              </label>
            </div>
            <textarea
              id="content"
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm p-4 font-mono transition-all duration-300"
              placeholder="Paste content here..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />

            {/* Content Analysis Panel */}
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {contentStats.words > 0 ? (
                  <>
                    {contentStats.words} words • {contentStats.chars} characters
                    • {contentStats.sentences} sentences •{' '}
                    {contentStats.paragraphs} paragraphs • ~
                    {contentStats.readingTime} min read •{' '}
                    {contentStats.avgWordsPerSentence} avg words/sentence
                  </>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    Paste content to see analysis
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleProcess}
              disabled={isProcessing || !content.trim()}
              className="w-24 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Process'}
            </button>

            <button
              type="button"
              onClick={() => {
                setContent('');
                setProcessedContent('');
                setProcessedChunks([]);
                setSaveStatus('');
                setProcessingSteps([]);
              }}
              disabled={!content && !processedContent}
              className="w-24 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Processing Steps Container */}
      {processingSteps.length > 0 && (
        <div className="max-w-5xl mx-auto mt-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Processing Steps
            </h3>
            <div className="flex items-center space-x-3 overflow-x-auto pb-1">
              {processingSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-1 min-w-0 flex-shrink-0"
                >
                  {/* Status Indicator */}
                  <div className="relative">
                    {step.completed ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : step.processing ? (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <svg
                          className="w-3 h-3 text-white animate-spin"
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
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-400 text-[10px] font-medium">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Step Name */}
                  <div className="text-center max-w-[80px]">
                    <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 leading-tight">
                      {step.name}
                    </p>
                  </div>
                  {/* Connector Line */}
                  {index < processingSteps.length - 1 && (
                    <div className="absolute top-3 left-6 w-3 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processed Content Container */}
      <div className="max-w-5xl mx-auto mt-8">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Processed Content
            {processedContent && (
              <span className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">
                {processedChunks.length > 1
                  ? `(${processedChunks.length} Chunks - Ready to Save)`
                  : '(Ready to Save)'}
              </span>
            )}
          </h3>

          {/* Display chunks */}
          {processedChunks.length > 0 ? (
            <div className="space-y-4">
              {processedChunks.map((chunk, index) => {
                const chunkWords = chunk
                  .trim()
                  .split(/\s+/)
                  .filter(w => w.length > 0).length;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {processedChunks.length > 1
                          ? `Chunk ${index + 1} of ${processedChunks.length}`
                          : 'Single Chunk'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {chunkWords} words • {chunk.length} chars
                      </span>
                    </div>
                    <div className="w-full rounded-md border border-green-300 bg-green-50 dark:bg-gray-800 dark:border-green-700 p-4 text-sm font-mono whitespace-pre-wrap break-words">
                      {chunk}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 p-4 text-sm min-h-[100px] flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500 italic">
                Processed content will appear here after clicking Process...
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {processedContent && (
            <div className="mt-4 flex items-center space-x-3">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!processedContent}
                className="w-24 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Copy All
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !processedContent}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving
                  ? 'Saving...'
                  : `Save ${processedChunks.length > 1 ? `All ${processedChunks.length} Chunks` : ''}`}
              </button>
              {copyStatus && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {copyStatus}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {saveStatus && (
        <div className="max-w-5xl mx-auto mt-6">
          <div className="p-3 rounded-md bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
              {saveStatus}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
