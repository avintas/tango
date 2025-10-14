'use client';

import { Heading } from '@/components/heading';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function SectionHeadersTestPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      <div className="mb-8">
        <Heading level={1}>Section Header Components</Heading>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Testing section headers for dividing content within pages. Perfect for
          organizing content, separating form sections, and creating visual
          hierarchy.
        </p>
      </div>

      {/* Version 1: Original Tailwind - Simple */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Version 1: Original Simple - Content Organization
        </h2>
        <div className="space-y-8">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Published Trivia Sets
            </h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
              View and manage your published trivia questions. All sets are live
              on onlyhockey.com and available for fans to play.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Draft Content
            </h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
              Work in progress content that needs review before publishing.
              Edit, preview, or schedule these items for future release.
            </p>
          </div>
        </div>
      </section>

      {/* Version 2: With Icon */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Version 2: With Icon - Visual Enhancement
        </h2>
        <div className="space-y-8">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Content Performance
                </h3>
              </div>
            </div>
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
              Track how your trivia sets and content are performing. View
              engagement metrics, popular categories, and user feedback.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Scheduled Releases
                </h3>
              </div>
            </div>
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
              Content queued for automatic publishing. Daily quizzes, seasonal
              content, and special event trivia scheduled for future dates.
            </p>
          </div>
        </div>
      </section>

      {/* Version 3: With Badge */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Version 3: With Status Badge
        </h2>
        <div className="space-y-8">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
            <div className="flex items-center space-x-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Daily Quiz Schedule
              </h3>
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                Active
              </span>
            </div>
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
              Your automated daily quiz system is running. Next quiz publishes
              tomorrow at 8:00 AM EST with 15 more scheduled for the next two
              weeks.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
            <div className="flex items-center space-x-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Halloween Special Collection
              </h3>
              <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:text-orange-200">
                Seasonal
              </span>
            </div>
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
              Spooky hockey trivia and themed content for October. Create, edit,
              or schedule Halloween-themed questions and fun facts.
            </p>
          </div>
        </div>
      </section>

      {/* Version 4: With Action Link */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Version 4: With Action Link
        </h2>
        <div className="space-y-8">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
              </div>
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                View all →
              </button>
            </div>
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
              Your latest content updates, published items, and recent edits.
              Stay on top of your content creation workflow.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Content Categories
                </h3>
              </div>
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                Manage →
              </button>
            </div>
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
              Organize your content by category: daily-quiz, halloween,
              playoffs, legends, and more. Create custom categories for special
              events.
            </p>
          </div>
        </div>
      </section>

      {/* Version 5: Compact - No Border */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Version 5: Compact (No Border) - Tight Spacing
        </h2>
        <div className="space-y-6">
          <div className="pb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Trivia Questions
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              45 published • 12 drafts
            </p>
          </div>

          <div className="pb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Stats & Facts
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              32 published • 8 drafts
            </p>
          </div>

          <div className="pb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Motivational Messages
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              50 published • 15 drafts
            </p>
          </div>
        </div>
      </section>

      {/* Version 6: With Stats Row */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Version 6: With Inline Stats
        </h2>
        <div className="space-y-8">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Content Library Overview
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    127
                  </span>{' '}
                  total
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    104
                  </span>{' '}
                  published
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    23
                  </span>{' '}
                  drafts
                </span>
              </div>
            </div>
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
              Complete collection of all your hockey content across trivia,
              stats, motivational messages, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Design Notes */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
          💡 Usage Guide
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-2">
          <li>
            • <strong>Version 1 (Original):</strong> Clean divider for basic
            content sections. Use between major page sections.
          </li>
          <li>
            • <strong>Version 2 (With Icon):</strong> Add visual interest with
            icons. Great for feature sections or categorized content.
          </li>
          <li>
            • <strong>Version 3 (With Badge):</strong> Show status or type at a
            glance. Perfect for active/inactive features or content types.
          </li>
          <li>
            • <strong>Version 4 (With Action):</strong> Include quick actions
            like &quot;View all&quot; or &quot;Manage&quot;. Improves navigation
            flow.
          </li>
          <li>
            • <strong>Version 5 (Compact):</strong> Tight spacing for dense
            content. Good for sidebars or compact lists.
          </li>
          <li>
            • <strong>Version 6 (With Stats):</strong> Display key metrics
            inline. Excellent for dashboards and overviews.
          </li>
          <li>• Use these within pages to organize content logically</li>
          <li>
            • Combine with cards, tables, or forms below each section header
          </li>
        </ul>
      </section>
    </div>
  );
}
