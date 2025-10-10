'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { parsePromptVariables } from '@/lib/parse-prompt-variables';
import {
  buildPromptRevised,
  getDefaultSelectionsRevised,
  getAnswerFormatOptions,
  shouldShowComparisonType,
  shouldShowAnswerFormat,
  PromptSelections,
} from '@/lib/prompt-builder-revised';
import {
  SparklesIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PromptGeneratorPage() {
  const [variables, setVariables] = useState<Record<string, string[]>>({});
  const [selections, setSelections] = useState<PromptSelections>({
    game_type: '',
    question_type: '',
    topic: '',
    audience: '',
    number_of_questions: '10',
    comparison_type: '',
    answer_format: '',
    fact_quality_1: '',
    fact_quality_2: '',
    difficulty_level: '',
    output_format: '',
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);
  const [status, setStatus] = useState('');
  const { session } = useAuth();

  // Load and parse variables from markdown file
  const fetchVariables = async () => {
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
        const parsedVars = parsePromptVariables(result.data.content);
        setVariables(parsedVars);

        // Set default selections
        const defaults = getDefaultSelectionsRevised(parsedVars);
        setSelections(defaults);
      }
    } catch (error) {
      console.error('Failed to fetch variables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Update prompt preview when selections change
  useEffect(() => {
    const prompt = buildPromptRevised(selections);
    setGeneratedPrompt(prompt);
  }, [selections]);

  // Reset conditional fields when question_type changes
  useEffect(() => {
    // Clear answer_format when question_type changes since options are different
    setSelections(prev => ({
      ...prev,
      answer_format: '',
      comparison_type:
        prev.question_type === 'Comparison' ? prev.comparison_type : '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections.question_type]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatus('Generating content with Gemini...');
    // Don't clear existing content - let user see previous results until new ones arrive

    try {
      const response = await fetch('/api/gemini/stories-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          prompt: generatedPrompt,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedContent(result.content || '');
        setStatus(
          `✅ Content generated successfully! (${result.processingTime}ms)`
        );
      } else {
        setStatus(`❌ Generation failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToSourced = async () => {
    if (!generatedContent.trim()) {
      setStatus('❌ No content to save. Generate content first.');
      return;
    }

    setSaving(true);
    setStatus('Saving to sourced text...');

    try {
      const response = await fetch('/api/sourced-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          original_text: generatedContent.trim(),
          content_type: 'trivia_source',
          content_tags: ['AI Generated', 'Gemini'],
          word_count: generatedContent
            .trim()
            .split(/\s+/)
            .filter(w => w.length > 0).length,
          char_count: generatedContent.length,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Saved to sourced text successfully!');
        setTimeout(() => {
          setGeneratedContent('');
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

  const handleReset = () => {
    const defaults = getDefaultSelectionsRevised(variables);
    setSelections(defaults);
    setGeneratedContent('');
    setStatus('');
  };

  const handleClearContent = () => {
    setGeneratedContent('');
    setStatus('');
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setStatus('📋 Prompt copied to clipboard!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    setStatus('📋 Content copied to clipboard!');
    setTimeout(() => setStatus(''), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Prompt Generator</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Stories Generator</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Generate hockey stories and narrative content
        </p>
      </div>

      {/* Configuration Form */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Configure Your Prompt
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Row 1: Core Required Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Game Type
              </label>
              <select
                value={selections.game_type}
                onChange={e =>
                  setSelections({ ...selections, game_type: e.target.value })
                }
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                {variables.game_type?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Type{' '}
                <span className="text-blue-600 text-xs">(Primary)</span>
              </label>
              <select
                value={selections.question_type}
                onChange={e =>
                  setSelections({
                    ...selections,
                    question_type: e.target.value,
                  })
                }
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                {variables.question_type?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic
              </label>
              <select
                value={selections.topic}
                onChange={e =>
                  setSelections({ ...selections, topic: e.target.value })
                }
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                {variables.topic?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audience
              </label>
              <select
                value={selections.audience}
                onChange={e =>
                  setSelections({ ...selections, audience: e.target.value })
                }
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                {variables.audience?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Questions
              </label>
              <select
                value={selections.number_of_questions}
                onChange={e =>
                  setSelections({
                    ...selections,
                    number_of_questions: e.target.value,
                  })
                }
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                {variables.number_of_questions?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output Format
              </label>
              <select
                value={selections.output_format}
                onChange={e =>
                  setSelections({
                    ...selections,
                    output_format: e.target.value,
                  })
                }
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                {variables.output_format?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 3: Conditional Fields - Only show if relevant */}
            {shouldShowComparisonType(selections.question_type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comparison Type{' '}
                  <span className="text-blue-600 text-xs">(Conditional)</span>
                </label>
                <select
                  value={selections.comparison_type}
                  onChange={e =>
                    setSelections({
                      ...selections,
                      comparison_type: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
                >
                  <option value="">-- None --</option>
                  {variables.comparison_type?.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {shouldShowAnswerFormat(selections.question_type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer Format{' '}
                  <span className="text-blue-600 text-xs">(Conditional)</span>
                </label>
                <select
                  value={selections.answer_format}
                  onChange={e =>
                    setSelections({
                      ...selections,
                      answer_format: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
                >
                  <option value="">-- None --</option>
                  {getAnswerFormatOptions(
                    selections.question_type,
                    variables
                  ).map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Row 4: Optional Quality Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level{' '}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <select
                value={selections.difficulty_level}
                onChange={e =>
                  setSelections({
                    ...selections,
                    difficulty_level: e.target.value,
                  })
                }
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                <option value="">-- None --</option>
                {variables.difficulty_level?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fact Quality 1{' '}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <select
                value={selections.fact_quality_1}
                onChange={e =>
                  setSelections({
                    ...selections,
                    fact_quality_1: e.target.value,
                  })
                }
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                <option value="">-- None --</option>
                {variables.fact_quality_1?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fact Quality 2{' '}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <select
                value={selections.fact_quality_2}
                onChange={e =>
                  setSelections({
                    ...selections,
                    fact_quality_2: e.target.value,
                  })
                }
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                <option value="">-- None --</option>
                {variables.fact_quality_2?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Live Prompt Preview */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Live Prompt Preview
            </h3>
            <button
              onClick={handleCopyPrompt}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              <span>Copy</span>
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {generatedPrompt}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !generatedPrompt}
            className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SparklesIcon className="h-5 w-5" />
            <span>
              {isGenerating ? 'Generating...' : 'Generate with Gemini'}
            </span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>

      {/* Generated Content Display */}
      {(isGenerating || generatedContent) && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generated Content
              </h3>
              {generatedContent && (
                <button
                  onClick={handleCopyContent}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  <span>Copy</span>
                </button>
              )}
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Generating content with Gemini...
                </p>
              </div>
            ) : generatedContent ? (
              <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                {/* Toggle between rendered and raw markdown */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Generated Content Preview
                  </h4>
                  <button
                    onClick={() => setShowRawMarkdown(!showRawMarkdown)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {showRawMarkdown ? 'Show Rendered' : 'Show Raw Markdown'}
                  </button>
                </div>

                <div className="p-6">
                  {showRawMarkdown ? (
                    <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded border">
                      {generatedContent}
                    </pre>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert text-gray-900 dark:text-gray-100">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {generatedContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {generatedContent && (
              <div className="mt-4 flex items-center space-x-4">
                <button
                  onClick={handleSaveToSourced}
                  disabled={isSaving}
                  className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save to Sourced Text'}
                </button>

                <button
                  onClick={handleClearContent}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Clear Content
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {status}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
