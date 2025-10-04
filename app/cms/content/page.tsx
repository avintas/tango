'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ContentEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState('');

  const processText = (text: string) => {
    // Simple text processing: clean up formatting, normalize whitespace
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/[ \t]+/g, ' ') // Normalize spaces and tabs
      .trim();
  };

  const handleProcess = async () => {
    if (!content.trim()) {
      setMessage('Please enter some content to process');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const processed = processText(content);
      setContent(processed);
      setMessage('Content processed successfully!');
    } catch (error) {
      setMessage('Error processing content');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage('Please provide both title and content');
      return;
    }

    setIsPosting(true);
    setMessage('');

    try {
      // Generate excerpt from content (first 150 characters)
      const excerpt =
        content.trim().substring(0, 150) +
        (content.trim().length > 150 ? '...' : '');

      const { data, error } = await supabase.from('content_items').insert({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt,
        status: 'published',
      });

      if (error) {
        throw error;
      }

      setMessage('Content posted successfully!');

      // Clear form
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error posting content:', error);
      setMessage('Error posting content. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Editor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ingest and process hockey content for Onlyhockey.com
        </p>
      </div>

      {/* Title input */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm/6 font-medium text-gray-900 dark:text-white"
        >
          Content Title
        </label>
        <div className="mt-2">
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter a title for your hockey content..."
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none sm:text-sm/6"
          />
        </div>
      </div>

      {/* Content textarea */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm/6 font-medium text-gray-900 dark:text-white"
        >
          Content
        </label>
        <div className="mt-2">
          <textarea
            id="content"
            name="content"
            rows={12}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your hockey content here... (trivia, stories, news, quotes, etc.)"
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none sm:text-sm/6"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-x-4">
        <button
          type="button"
          onClick={handleProcess}
          disabled={isProcessing || !content.trim()}
          className="inline-flex items-center gap-x-2 rounded-md bg-yellow-500 px-3 py-2 text-sm/6 font-semibold text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
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
              Processing...
            </>
          ) : (
            'Process'
          )}
        </button>

        <button
          type="button"
          onClick={handlePost}
          disabled={isPosting || !title.trim() || !content.trim()}
          className="inline-flex items-center gap-x-2 rounded-md bg-green-600 px-3 py-2 text-sm/6 font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPosting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
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
              Posting...
            </>
          ) : (
            'Post'
          )}
        </button>
      </div>

      {/* Message display */}
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.includes('Error') || message.includes('Please')
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
          }`}
        >
          <div className="text-sm/6 font-medium">{message}</div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="text-sm/6 font-medium text-blue-900 dark:text-blue-400 mb-2">
          How to use this content ingester:
        </div>
        <ul className="text-sm/6 text-blue-800 dark:text-blue-300 space-y-1">
          <li>
            • <strong>Title:</strong> Give your content a descriptive title
          </li>
          <li>
            • <strong>Content:</strong> Paste hockey content from any source
            (trivia, stories, news, quotes)
          </li>
          <li>
            • <strong>Process:</strong> Clean and normalize the text formatting
          </li>
          <li>
            • <strong>Post:</strong> Save the content to the database for
            Onlyhockey.com
          </li>
        </ul>
      </div>
    </div>
  );
}
