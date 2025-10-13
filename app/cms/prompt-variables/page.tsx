'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function PromptVariablesPage() {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [contentType, setContentType] = useState('trivia');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const { session } = useAuth();

  const fetchContent = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/prompt-variables', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setContent(result.data.content);
        setOriginalContent(result.data.content);
        setContentType(result.data.contentType || 'trivia');
      } else {
        setStatus(`❌ Failed to load: ${result.error}`);
      }
    } catch (error) {
      setStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleSave = async () => {
    if (!content.trim()) {
      setStatus('❌ Content cannot be empty.');
      return;
    }

    setSaving(true);
    setStatus('Saving changes...');

    try {
      const response = await fetch('/api/prompt-variables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ content, contentType }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Saved successfully! Changes are now active.');
        setOriginalContent(content);
        setTimeout(() => {
          setStatus('');
        }, 3000);
      } else {
        setStatus(`❌ Save failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    if (
      confirm(
        'Are you sure you want to revert all changes? This cannot be undone.'
      )
    ) {
      setContent(originalContent);
      setStatus('↩️ Reverted to last saved version');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const hasChanges = content !== originalContent;
  const lineCount = content.split('\n').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">
            Prompt Variables Editor
          </h1>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Prompt Variables Editor
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Edit the markdown file to configure prompt generator options
            </p>
          </div>
          {hasChanges && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              prompt-variables.md
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {lineCount} lines • {content.length} characters
            </div>
          </div>

          <div className="mb-6">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={30}
              className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-4 font-mono"
              placeholder="# Prompt Generator Variables

## variable_name
- Option 1
- Option 2
- Option 3"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {hasChanges && (
              <button
                type="button"
                onClick={handleRevert}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Revert Changes
              </button>
            )}
          </div>

          {status && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {status}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Editing Guide
          </h3>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start space-x-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Add a new category:</p>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  ## new_variable_name
                </code>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Add options to a category:</p>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  - New option here
                </code>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Format:</p>
                <p className="text-xs text-gray-500">
                  Use ## for category names, - for options. Keep it simple!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <DocumentTextIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-500">
                  Important:
                </p>
                <p className="text-xs text-gray-500">
                  Changes take effect immediately. Make sure to commit to Git
                  for version control!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
