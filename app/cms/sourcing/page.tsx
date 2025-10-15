'use client';

import { useReducer } from 'react';
import { useAuth } from '@/lib/auth-context';
import { processText } from '@/lib/text-processing';

// State interface
interface SourcingState {
  processedContent: string;
  isProcessing: boolean;
  isSaving: boolean;
  saveStatus: string;
  copyStatus: string;
  pasteZoneStatus: string;
}

// Action types
type SourcingAction =
  | { type: 'SET_PROCESSED_CONTENT'; payload: string }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_SAVE_STATUS'; payload: string }
  | { type: 'SET_COPY_STATUS'; payload: string }
  | { type: 'SET_PASTE_ZONE_STATUS'; payload: string }
  | { type: 'CLEAR_ALL_STATES' }
  | { type: 'CLEAR_STATUS_MESSAGES' };

// Initial state
const initialState: SourcingState = {
  processedContent: '',
  isProcessing: false,
  isSaving: false,
  saveStatus: '',
  copyStatus: '',
  pasteZoneStatus: '',
};

// Reducer function
function sourcingReducer(
  state: SourcingState,
  action: SourcingAction
): SourcingState {
  switch (action.type) {
    case 'SET_PROCESSED_CONTENT':
      return { ...state, processedContent: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'SET_COPY_STATUS':
      return { ...state, copyStatus: action.payload };
    case 'SET_PASTE_ZONE_STATUS':
      return { ...state, pasteZoneStatus: action.payload };
    case 'CLEAR_ALL_STATES':
      return initialState;
    case 'CLEAR_STATUS_MESSAGES':
      return {
        ...state,
        saveStatus: '',
        copyStatus: '',
        pasteZoneStatus: '',
      };
    default:
      return state;
  }
}

export default function SourcingPage() {
  const [state, dispatch] = useReducer(sourcingReducer, initialState);
  const { session } = useAuth();

  // Helper function to get comprehensive content statistics
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

  // Helper function to count words (for backward compatibility)
  const getWordCount = (text: string) => {
    return getContentStats(text).words;
  };

  // Helper function to clear all states
  const clearAllStates = () => {
    dispatch({ type: 'CLEAR_ALL_STATES' });
  };

  // Extract clipboard processing logic
  const processClipboard = async (text: string) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({
      type: 'SET_PASTE_ZONE_STATUS',
      payload: '✨ Processing your content...',
    });

    try {
      const result = await processText(text);
      dispatch({
        type: 'SET_PROCESSED_CONTENT',
        payload: result.processedText,
      });
      dispatch({
        type: 'SET_SAVE_STATUS',
        payload: '✅ Content processed and ready!',
      });
      dispatch({ type: 'SET_PASTE_ZONE_STATUS', payload: '✅ Ready to save!' });
    } catch (error) {
      dispatch({
        type: 'SET_SAVE_STATUS',
        payload: `❌ Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      dispatch({ type: 'SET_PASTE_ZONE_STATUS', payload: '' });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const handlePasteZone = async () => {
    try {
      // Read from clipboard
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText.trim()) {
        dispatch({
          type: 'SET_PASTE_ZONE_STATUS',
          payload: '❌ Clipboard is empty',
        });
        setTimeout(
          () => dispatch({ type: 'SET_PASTE_ZONE_STATUS', payload: '' }),
          2000
        );
        return;
      }

      // Clear previous status messages
      dispatch({ type: 'CLEAR_STATUS_MESSAGES' });

      // Process the clipboard content
      await processClipboard(clipboardText);
    } catch (error) {
      dispatch({
        type: 'SET_PASTE_ZONE_STATUS',
        payload: '❌ Could not read clipboard. Try pasting with Ctrl+V',
      });
      setTimeout(
        () => dispatch({ type: 'SET_PASTE_ZONE_STATUS', payload: '' }),
        3000
      );
    }
  };

  const handleSave = async () => {
    if (!state.processedContent?.trim()) {
      dispatch({
        type: 'SET_SAVE_STATUS',
        payload: '❌ Please process content before saving.',
      });
      return;
    }

    // Clear previous status messages
    dispatch({ type: 'CLEAR_STATUS_MESSAGES' });

    dispatch({ type: 'SET_SAVING', payload: true });
    dispatch({ type: 'SET_SAVE_STATUS', payload: 'Saving to Supabase...' });

    try {
      const wordCount = getWordCount(state.processedContent);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/content-source`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          processed_content: state.processedContent.trim(),
          word_count: wordCount,
          char_count: state.processedContent.length,
        }),
      });

      const result = await response.json();

      if (result.success) {
        dispatch({
          type: 'SET_SAVE_STATUS',
          payload: '✅ Content saved successfully!',
        });
        dispatch({
          type: 'SET_PASTE_ZONE_STATUS',
          payload: '✅ Saved! Click to paste new content.',
        });
      } else {
        dispatch({
          type: 'SET_SAVE_STATUS',
          payload: `❌ Save failed: ${result.error || 'Unknown error'}`,
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_SAVE_STATUS',
        payload: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  const handleCopy = async () => {
    if (!state.processedContent) return;

    // Clear previous status messages
    dispatch({ type: 'CLEAR_STATUS_MESSAGES' });

    try {
      await navigator.clipboard.writeText(state.processedContent);
      dispatch({ type: 'SET_COPY_STATUS', payload: '✅ Copied to clipboard!' });
      setTimeout(
        () => dispatch({ type: 'SET_COPY_STATUS', payload: '' }),
        2000
      );
    } catch (error) {
      dispatch({ type: 'SET_COPY_STATUS', payload: '❌ Failed to copy' });
      setTimeout(
        () => dispatch({ type: 'SET_COPY_STATUS', payload: '' }),
        2000
      );
    }
  };

  const handleDownloadMarkdown = () => {
    if (!state.processedContent) return;

    // Clear previous status messages
    dispatch({ type: 'CLEAR_STATUS_MESSAGES' });

    try {
      const blob = new Blob([state.processedContent], {
        type: 'text/markdown',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed-content-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      dispatch({
        type: 'SET_COPY_STATUS',
        payload: '📄 Downloaded as Markdown!',
      });
      setTimeout(
        () => dispatch({ type: 'SET_COPY_STATUS', payload: '' }),
        2000
      );
    } catch (error) {
      dispatch({ type: 'SET_COPY_STATUS', payload: '❌ Download failed' });
      setTimeout(
        () => dispatch({ type: 'SET_COPY_STATUS', payload: '' }),
        2000
      );
    }
  };

  const handleDownloadJSON = () => {
    if (!state.processedContent) return;

    // Clear previous status messages
    dispatch({ type: 'CLEAR_STATUS_MESSAGES' });

    try {
      const stats = getContentStats(state.processedContent);
      const jsonData = {
        content: state.processedContent,
        statistics: stats,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'Content Sourcing Tool',
          version: '1.0',
        },
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed-content-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      dispatch({ type: 'SET_COPY_STATUS', payload: '📄 Downloaded as JSON!' });
      setTimeout(
        () => dispatch({ type: 'SET_COPY_STATUS', payload: '' }),
        2000
      );
    } catch (error) {
      dispatch({ type: 'SET_COPY_STATUS', payload: '❌ Download failed' });
      setTimeout(
        () => dispatch({ type: 'SET_COPY_STATUS', payload: '' }),
        2000
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Sourcing Section */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Content Sourcing
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Process content from clipboard and manage processed results
            </p>
          </div>

          {/* Divider */}
          <div className="mb-6">
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* Action Cards */}
          <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow-sm sm:grid sm:grid-cols-3 sm:divide-y-0 mb-6">
            {/* Paste Action */}
            <button
              type="button"
              onClick={handlePasteZone}
              disabled={state.isProcessing}
              className={`group relative border-gray-200 p-6 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 sm:odd:not-nth-last-2:border-b sm:even:border-l sm:even:not-last:border-b disabled:cursor-not-allowed transition-all duration-300 ${
                state.isProcessing
                  ? 'bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-yellow-300 shadow-lg animate-pulse'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div>
                <span
                  className={`inline-flex rounded-lg p-3 text-yellow-700 transition-all duration-300 ${
                    state.isProcessing
                      ? 'bg-gradient-to-r from-yellow-200 to-orange-200 shadow-md animate-pulse'
                      : 'bg-yellow-50'
                  }`}
                >
                  <svg
                    className={`h-6 w-6 transition-all duration-300 ${
                      state.isProcessing ? 'animate-spin' : ''
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l1.5 4.5h4.5l-3.75 3L15.75 14l-3.75-3L8.25 14l1.5-4.5L6 6.5h4.5L12 2z" />
                    <path d="M19 9l1 1-1 1-1-1 1-1z" />
                    <path d="M5 9l1 1-1 1-1-1 1-1z" />
                    <path d="M12 20l1 1-1 1-1-1 1-1z" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-base font-semibold text-gray-900">
                  <span className="focus:outline-hidden">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {state.isProcessing
                      ? 'Processing...'
                      : 'Click to Process Content'}
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {state.isProcessing
                    ? 'Analyzing and processing your content...'
                    : 'Content auto-processed from clipboard'}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                >
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </button>

            {/* Clear Action */}
            <button
              type="button"
              onClick={clearAllStates}
              disabled={
                !state.processedContent &&
                !state.pasteZoneStatus &&
                !state.isProcessing &&
                !state.isSaving
              }
              className="group relative border-gray-200 bg-white p-6 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 sm:odd:not-nth-last-2:border-b sm:even:border-l sm:even:not-last:border-b disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>
                <span className="inline-flex rounded-lg p-3 bg-red-50 text-red-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-base font-semibold text-gray-900">
                  <span className="focus:outline-hidden">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Clear Memory
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Clear all processed content and start fresh
                </p>
              </div>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                >
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </button>

            {/* Copy Action */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!state.processedContent}
              className="group relative border-gray-200 bg-white p-6 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 sm:odd:not-nth-last-2:border-b sm:even:border-l sm:even:not-last:border-b disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>
                <span className="inline-flex rounded-lg p-3 bg-blue-50 text-blue-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-base font-semibold text-gray-900">
                  <span className="focus:outline-hidden">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Copy Content
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Copy processed content to clipboard
                </p>
              </div>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                >
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </button>

            {/* Save Action */}
            <button
              type="button"
              onClick={handleSave}
              disabled={state.isSaving || !state.processedContent}
              className="group relative border-gray-200 bg-white p-6 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 sm:odd:not-nth-last-2:border-b sm:even:border-l sm:even:not-last:border-b disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>
                <span className="inline-flex rounded-lg p-3 bg-green-50 text-green-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-base font-semibold text-gray-900">
                  <span className="focus:outline-hidden">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {state.isSaving ? 'Saving...' : 'Save Content'}
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Save processed content to database
                </p>
              </div>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                >
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </button>

            {/* Download Markdown Action */}
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              disabled={!state.processedContent}
              className="group relative border-gray-200 bg-white p-6 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 sm:odd:not-nth-last-2:border-b sm:even:border-l sm:even:not-last:border-b disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>
                <span className="inline-flex rounded-lg p-3 bg-purple-50 text-purple-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-base font-semibold text-gray-900">
                  <span className="focus:outline-hidden">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Download Markdown
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">Save as .md file</p>
              </div>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                >
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </button>

            {/* Download JSON Action */}
            <button
              type="button"
              onClick={handleDownloadJSON}
              disabled={!state.processedContent}
              className="group relative border-gray-200 bg-white p-6 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 sm:odd:not-nth-last-2:border-b sm:even:border-l sm:even:not-last:border-b disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>
                <span className="inline-flex rounded-lg p-3 bg-orange-50 text-orange-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-base font-semibold text-gray-900">
                  <span className="focus:outline-hidden">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Download JSON
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Save with metadata & stats
                </p>
              </div>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                >
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-6">
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* Status Messages */}
          {(state.saveStatus || state.copyStatus) && (
            <div className="mb-6 space-y-3">
              {state.saveStatus && (
                <div className="p-3 rounded-md bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                    {state.saveStatus}
                  </p>
                </div>
              )}
              {state.copyStatus && (
                <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {state.copyStatus}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Processed Content Display */}
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Processed Content
              {state.processedContent && (
                <span className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">
                  (Ready to Save)
                </span>
              )}
            </h3>

            <div
              className={`w-full rounded-md border p-4 text-sm font-mono whitespace-pre-wrap break-words ${
                state.processedContent
                  ? 'border-green-300 bg-green-50 dark:bg-gray-800 dark:border-green-700'
                  : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 min-h-[100px]'
              }`}
            >
              {state.processedContent || (
                <span className="text-gray-400 dark:text-gray-500 italic">
                  Processed content will appear here after pasting...
                </span>
              )}
            </div>

            {state.processedContent && (
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {(() => {
                    const stats = getContentStats(state.processedContent);
                    return (
                      <>
                        {stats.words} words • {stats.chars} characters •{' '}
                        {stats.sentences} sentences • {stats.paragraphs}{' '}
                        paragraphs • ~{stats.readingTime} min read •{' '}
                        {stats.avgWordsPerSentence} avg words/sentence
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
