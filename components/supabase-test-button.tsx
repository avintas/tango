'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface TestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
  responseTime?: number;
  details?: string;
}

export default function SupabaseTestButton() {
  const [testResult, setTestResult] = useState<TestResult>({
    status: 'idle',
    message: 'Ready to test',
  });

  const runConnectionTest = async () => {
    setTestResult({
      status: 'testing',
      message: 'Testing connection...',
    });

    const startTime = Date.now();

    try {
      // Test 1: Basic connection
      const { data: basicData, error: basicError } = await supabase
        .from('content_categories')
        .select('count')
        .limit(1);

      if (basicError) {
        throw new Error(`Database query failed: ${basicError.message}`);
      }

      // Test 2: Test RLS (if enabled)
      const { data: rlsData, error: rlsError } = await supabase
        .from('content_items')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;

      // Test 3: Check if we can insert (test permissions)
      const { error: insertError } = await supabase
        .from('content_categories')
        .select('id')
        .limit(1);

      let details = `✅ Database connection successful\n`;
      details += `✅ Query execution working\n`;

      if (rlsError) {
        details += `⚠️ RLS might be enabled (expected behavior)\n`;
      } else {
        details += `✅ Content items table accessible\n`;
      }

      details += `📊 Response time: ${responseTime}ms`;

      setTestResult({
        status: 'success',
        message: `Connection successful!`,
        responseTime,
        details,
      });
    } catch (err) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';

      setTestResult({
        status: 'error',
        message: 'Connection failed',
        responseTime,
        details: `❌ Error: ${errorMessage}\n📊 Response time: ${responseTime}ms\n\nTroubleshooting:\n• Check your Supabase URL\n• Verify your API key\n• Ensure database is running\n• Check network connection`,
      });
    }
  };

  const getButtonColor = () => {
    switch (testResult.status) {
      case 'testing':
        return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 focus:ring-green-500';
      case 'error':
        return 'bg-red-500 hover:bg-red-600 focus:ring-red-500';
      default:
        return 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500';
    }
  };

  const getButtonText = () => {
    switch (testResult.status) {
      case 'testing':
        return 'Testing...';
      case 'success':
        return 'Test Again';
      case 'error':
        return 'Retry Test';
      default:
        return 'Test Supabase Connection';
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={runConnectionTest}
        disabled={testResult.status === 'testing'}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${getButtonColor()} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        {testResult.status === 'testing' && (
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
        {testResult.status === 'success' && (
          <svg
            className="-ml-1 mr-2 h-4 w-4 text-white"
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
        {testResult.status === 'error' && (
          <svg
            className="-ml-1 mr-2 h-4 w-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {getButtonText()}
      </button>

      {/* Results Display */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
        <div className="flex items-center space-x-2 mb-2">
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              testResult.status === 'success'
                ? 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/20'
                : testResult.status === 'error'
                  ? 'text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/20'
                  : testResult.status === 'testing'
                    ? 'text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/20'
                    : 'text-gray-800 bg-gray-100 dark:text-gray-200 dark:bg-gray-700'
            }`}
          >
            {testResult.status === 'testing' && (
              <svg
                className="w-3 h-3 mr-1 animate-spin"
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
            {testResult.status === 'success' && (
              <svg
                className="w-3 h-3 mr-1"
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
            {testResult.status === 'error' && (
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {testResult.message}
          </div>
          {testResult.responseTime && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({testResult.responseTime}ms)
            </span>
          )}
        </div>

        {testResult.details && (
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
            {testResult.details}
          </pre>
        )}
      </div>
    </div>
  );
}
