'use client';

import { Heading } from '@/components/heading';
import {
  PlusIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function PageHeadersTestPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      <div className="mb-8">
        <Heading level={1}>Page Header Components</Heading>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Testing page header layouts adapted from Tailwind UI. Perfect for CMS
          pages, content listings, and dashboards.
        </p>
      </div>

      {/* Version 1: Original Tailwind - Adapted for Trivia */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 1: Original Style - Trivia Sets
        </h2>
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6 bg-white dark:bg-gray-800 rounded-t-lg">
          <div className="-mt-4 -ml-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="mt-4 ml-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Trivia Sets
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your published and draft trivia questions. Create new
                daily quizzes or seasonal content.
              </p>
            </div>
            <div className="mt-4 ml-4 shrink-0">
              <button
                type="button"
                className="relative inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create New Trivia
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Version 2: With Icon and Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 2: With Icon and Stats
        </h2>
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6 bg-white dark:bg-gray-800 rounded-t-lg">
          <div className="-mt-4 -ml-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="mt-4 ml-4 flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏒</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Published Content
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  127 total items • 45 trivia • 32 stats • 50 motivational
                </p>
              </div>
            </div>
            <div className="mt-4 ml-4 shrink-0 flex items-center space-x-3">
              <button
                type="button"
                className="relative inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                type="button"
                className="relative inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Content
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Version 3: With Search and Filter */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 3: With Search and Filter
        </h2>
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6 bg-white dark:bg-gray-800 rounded-t-lg">
          <div className="-mt-4 -ml-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="mt-4 ml-4 flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Content Library
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Browse and search all your hockey content
              </p>
            </div>
            <div className="mt-4 ml-4 shrink-0 flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-48 pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Version 4: Compact with Tabs */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 4: Compact with Status Tabs
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4 sm:px-6">
            <div className="-mt-2 -ml-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
              <div className="mt-2 ml-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Review & Publish
                </h3>
                <div className="mt-2 flex items-center space-x-4">
                  <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 pb-2">
                    Drafts (23)
                  </button>
                  <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pb-2">
                    Published (104)
                  </button>
                  <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pb-2">
                    Scheduled (12)
                  </button>
                </div>
              </div>
              <div className="mt-2 ml-4 shrink-0">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                >
                  Publish Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Version 5: Split Layout with Actions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 5: Split Layout - Daily Quiz Manager
        </h2>
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-5 sm:px-6">
          <div className="-mt-4 -ml-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="mt-4 ml-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Daily Quiz Schedule
                </h3>
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                  Active
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Next quiz publishes tomorrow at 8:00 AM • 15 quizzes scheduled
                for next 2 weeks
              </p>
            </div>
            <div className="mt-4 ml-4 shrink-0 flex items-center space-x-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                View Schedule
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Design Notes */}
      <section className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
          💡 Usage Recommendations
        </h3>
        <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-2">
          <li>
            • <strong>Version 1:</strong> Clean and simple. Perfect for basic
            content listing pages.
          </li>
          <li>
            • <strong>Version 2:</strong> Add icons and quick stats. Great for
            dashboards or overview pages.
          </li>
          <li>
            • <strong>Version 3:</strong> Include search and filter. Best for
            content library or large datasets.
          </li>
          <li>
            • <strong>Version 4:</strong> Compact with tabs. Ideal for
            status-based views (drafts/published).
          </li>
          <li>
            • <strong>Version 5:</strong> Prominent with gradient background.
            Use for important sections like scheduling.
          </li>
          <li>
            • All versions are responsive and work on mobile/tablet/desktop
          </li>
          <li>• Use these as top sections for your CMS pages</li>
        </ul>
      </section>
    </div>
  );
}
