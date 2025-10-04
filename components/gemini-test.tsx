'use client';

import { useState } from 'react';
import {
  testGeminiConnection,
  generateTriviaQuestions,
  analyzeContent,
} from '@/lib/gemini';

export default function GeminiTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [sampleContent, setSampleContent] = useState('');

  const handleConnectionTest = async () => {
    setIsTesting(true);
    setTestResult('Testing Gemini API connection...');

    try {
      const response = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setTestResult('✅ Gemini API connection successful!');
      } else {
        setTestResult(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(
        `❌ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleTriviaTest = async () => {
    if (!sampleContent.trim()) {
      setTestResult('❌ Please enter some sample content first.');
      return;
    }

    setIsTesting(true);
    setTestResult('Generating trivia questions...');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: sampleContent,
          contentType: 'trivia_questions',
          numItems: 3,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const questionsText = result.content
          .map(
            (q: any, i: number) =>
              `${i + 1}. ${q.question}\n   ✓ ${q.correct_answer}\n   ✗ ${q.incorrect_answers.join(', ')}\n   Difficulty: ${q.difficulty}`
          )
          .join('\n\n');

        setTestResult(
          `✅ Generated ${result.content.length} trivia questions (${result.processingTime}ms):\n\n${questionsText}`
        );
      } else {
        setTestResult(`❌ Trivia generation failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(
        `❌ Trivia test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleAnalysisTest = async () => {
    if (!sampleContent.trim()) {
      setTestResult('❌ Please enter some sample content first.');
      return;
    }

    setIsTesting(true);
    setTestResult('Analyzing content...');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: sampleContent,
          contentType: 'factoids',
          numItems: 3,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const factoidsText = result.content
          .map(
            (f: any, i: number) =>
              `${i + 1}. ${f.fact}\n   Category: ${f.category} | Difficulty: ${f.difficulty}`
          )
          .join('\n\n');

        setTestResult(
          `✅ Content Analysis - Generated ${result.content.length} factoids (${result.processingTime}ms):\n\n${factoidsText}`
        );
      } else {
        setTestResult(`❌ Analysis failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(
        `❌ Analysis test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Gemini API Test Suite
      </h3>

      {/* Connection Test */}
      <div className="mb-6 space-y-3">
        <button
          onClick={handleConnectionTest}
          disabled={isTesting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isTesting && (
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
          Test API Connection
        </button>

        <button
          onClick={async () => {
            setIsTesting(true);
            setTestResult('Fetching available models...');
            try {
              const response = await fetch('/api/gemini/models');
              const result = await response.json();
              if (result.success) {
                const modelsText = result.models
                  .map((m: any) => `${m.name} - ${m.displayName}`)
                  .join('\n');
                setTestResult(`✅ Available Models:\n${modelsText}`);
              } else {
                setTestResult(`❌ Error: ${result.error}`);
              }
            } catch (error) {
              setTestResult(`❌ Error: ${error}`);
            } finally {
              setIsTesting(false);
            }
          }}
          disabled={isTesting}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          List Available Models
        </button>
      </div>

      {/* Sample Content */}
      <div className="mb-6">
        <label
          htmlFor="sampleContent"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Sample Hockey Content for Testing
        </label>
        <textarea
          id="sampleContent"
          name="sampleContent"
          rows={4}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          placeholder="Enter some hockey content to test trivia generation..."
          value={sampleContent}
          onChange={e => setSampleContent(e.target.value)}
        />
      </div>

      {/* Test Buttons */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={handleTriviaTest}
          disabled={isTesting || !sampleContent.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Test Trivia Generation
        </button>

        <button
          onClick={handleAnalysisTest}
          disabled={isTesting || !sampleContent.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Test Content Analysis
        </button>
      </div>

      {/* Results */}
      {testResult && (
        <div
          className={`p-4 rounded-md ${
            testResult.includes('✅')
              ? 'bg-green-50 border border-green-200'
              : testResult.includes('❌')
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <pre
            className={`text-sm whitespace-pre-wrap ${
              testResult.includes('✅')
                ? 'text-green-800'
                : testResult.includes('❌')
                  ? 'text-red-800'
                  : 'text-blue-800'
            }`}
          >
            {testResult}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Test Instructions:
        </h4>
        <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
          <li>
            First, test the API connection to verify your GEMINI_API_KEY is
            working
          </li>
          <li>
            Enter some hockey content (e.g., player stats, team history, game
            facts)
          </li>
          <li>
            Test trivia generation to see if questions are created properly
          </li>
          <li>Test content analysis to see content quality assessment</li>
        </ol>
      </div>
    </div>
  );
}
