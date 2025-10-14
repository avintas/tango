'use client';

import Link from 'next/link';
import { Heading } from '@/components/heading';
import {
  BeakerIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function TestingHomePage() {
  const testPages = [
    {
      name: 'UI Components',
      href: '/testing/components',
      description: 'Test individual UI components with sample data',
      icon: BeakerIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Trivia Layouts',
      href: '/testing/trivia',
      description: 'Preview different trivia card designs',
      icon: DocumentTextIcon,
      color: 'bg-indigo-500',
    },
    {
      name: 'Content Cards',
      href: '/testing/cards',
      description: 'Test various content card styles',
      icon: SparklesIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Data Tables',
      href: '/testing/tables',
      description: 'Preview different table layouts',
      icon: ChartBarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Profile Cards',
      href: '/testing/profile-cards',
      description: 'Test profile-style content cards (Tailwind UI)',
      icon: DocumentTextIcon,
      color: 'bg-orange-500',
    },
    {
      name: 'Page Headers',
      href: '/testing/page-headers',
      description: 'Test page header layouts with actions',
      icon: SparklesIcon,
      color: 'bg-teal-500',
    },
    {
      name: 'Section Headers',
      href: '/testing/section-headers',
      description: 'Test section dividers and content organization',
      icon: DocumentTextIcon,
      color: 'bg-cyan-500',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Heading level={1}>🧪 Testing Playground</Heading>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Experiment with UI components and layouts using sample data. Nothing
          here affects your production content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testPages.map(page => (
          <Link
            key={page.href}
            href={page.href}
            className="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-lg ${page.color} text-white group-hover:scale-110 transition-transform`}
              >
                <page.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {page.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {page.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          💡 How to Use This Testing Area
        </h4>
        <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>
            • All data here is mock/sample data from{' '}
            <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">
              lib/fixtures/
            </code>
          </li>
          <li>• Changes here do not affect your real content or database</li>
          <li>
            • Copy components you like to{' '}
            <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">
              components/
            </code>{' '}
            when ready
          </li>
          <li>
            • This entire section can be deleted before production deployment
          </li>
        </ul>
      </div>
    </div>
  );
}
