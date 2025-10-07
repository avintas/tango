'use client';

import { useState } from 'react';

export default function SourceProcessor() {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const handleSave = async () => {
    if (!content.trim()) {
      setSaveStatus('❌ Please enter some content to save.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('Saving to Supabase...');

    try {
      const response = await fetch('/api/source-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          contentType: 'source_processor', // Default type for this page
          wordCount: content
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0).length,
          characterCount: content.length,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus('✅ Content saved successfully to Supabase!');
        // Clear content and status after successful save
        setTimeout(() => {
          setContent('');
          setSaveStatus('');
        }, 2000);
      } else {
        setSaveStatus(`❌ Save failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setSaveStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Source Processor
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Paste content and save it directly to the database. Simple and
          focused.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content Input
          </h3>

          {/* Text Area */}
          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Paste your content here
            </label>
            <textarea
              id="content"
              rows={12}
              className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              placeholder="Paste any content you want to save to the database..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                {
                  content
                    .trim()
                    .split(/\s+/)
                    .filter(word => word.length > 0).length
                }{' '}
                words
              </span>
              <span>{content.length} characters</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            {content && (
              <button
                type="button"
                onClick={() => {
                  setContent('');
                  setSaveStatus('');
                }}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Message */}
          {saveStatus && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {saveStatus}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
