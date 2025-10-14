'use client';

import { Heading } from '@/components/heading';
import {
  sampleTriviaSet,
  sampleMotivational,
  sampleStats,
} from '@/lib/fixtures/sample-trivia';

export default function ComponentsTestPage() {
  const triviaData = JSON.parse(sampleTriviaSet.markdown_content);
  const statsData = JSON.parse(sampleStats.markdown_content);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Heading level={1}>UI Components Testing</Heading>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
        Test and preview UI components with real sample data
      </p>

      {/* Content Type Badge */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Content Type Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full text-xs font-medium">
            Trivia
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
            Stats
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium">
            Motivational
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium">
            Halloween
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">
            Playoffs
          </span>
        </div>
      </section>

      {/* Trivia Question Card */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Trivia Question Card (Option 1 - Minimal)
        </h2>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            {triviaData[0].question}
          </h3>
          <div className="space-y-2">
            {[triviaData[0].correct_answer, ...triviaData[0].incorrect_answers]
              .sort()
              .map((answer, idx) => (
                <button
                  key={idx}
                  className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors text-sm"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300 mr-3">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {answer}
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* Motivational Card */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Motivational Message Card
        </h2>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">💪</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {sampleMotivational.title}
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {sampleMotivational.markdown_content}
          </p>
          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              {sampleMotivational.category}
            </span>
          </div>
        </div>
      </section>

      {/* Stats Card */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Stats Fact Card
        </h2>
        <div className="bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {statsData[0].statistic}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {statsData[0].value}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {statsData[0].context}
              </p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>
      </section>

      {/* Add your own experiments below */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🎨 Your Custom Experiments
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Add your own component experiments here!
            <br />
            Edit{' '}
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
              app/testing/components/page.tsx
            </code>
          </p>
        </div>
      </section>
    </div>
  );
}
