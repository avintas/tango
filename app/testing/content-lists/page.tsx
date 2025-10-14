'use client';

import { Heading } from '@/components/heading';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import {
  allSampleContent,
  sampleTriviaSet,
  sampleHalloweenTrivia,
  sampleMotivational,
  sampleStats,
} from '@/lib/fixtures/sample-trivia';

// Enhanced sample data for list testing
const contentItems = [
  {
    id: 1,
    title: 'NHL Records Daily Quiz',
    type: 'trivia',
    status: 'Published',
    category: 'daily-quiz',
    publishedDate: 'Oct 14, 2025',
    publishedDateTime: '2025-10-14T08:00Z',
    createdBy: 'Admin',
    itemCount: 3,
  },
  {
    id: 2,
    title: 'Halloween Special - Spooky Stats',
    type: 'trivia',
    status: 'Scheduled',
    category: 'halloween',
    publishedDate: 'Oct 31, 2025',
    publishedDateTime: '2025-10-31T08:00Z',
    createdBy: 'Admin',
    itemCount: 5,
  },
  {
    id: 3,
    title: 'Monday Motivation - Comeback Stories',
    type: 'motivational',
    status: 'Published',
    category: 'monday-motivation',
    publishedDate: 'Oct 14, 2025',
    publishedDateTime: '2025-10-14T06:00Z',
    createdBy: 'Admin',
    itemCount: 1,
  },
  {
    id: 4,
    title: 'Playoff Stats - 2025 Edition',
    type: 'stats',
    status: 'Draft',
    category: 'playoffs',
    publishedDate: null,
    publishedDateTime: null,
    createdBy: 'Admin',
    itemCount: 2,
  },
  {
    id: 5,
    title: 'Christmas Hockey Trivia',
    type: 'trivia',
    status: 'Scheduled',
    category: 'christmas',
    publishedDate: 'Dec 25, 2025',
    publishedDateTime: '2025-12-25T08:00Z',
    createdBy: 'Editor',
    itemCount: 10,
  },
];

export default function ContentListsTestPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      <div className="mb-8">
        <Heading level={1}>Content List Components</Heading>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Testing list layouts for content management. Perfect for Review &
          Publish pages, content libraries, and dashboards.
        </p>
      </div>

      {/* Version 1: Original Tailwind - Adapted for Content */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 1: Original Style - Content Management
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul
            role="list"
            className="divide-y divide-gray-100 dark:divide-gray-700"
          >
            {contentItems.map(item => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-x-6 py-5 px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-start gap-x-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                    {item.status === 'Draft' && (
                      <p className="mt-0.5 rounded-md bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-600">
                        {item.status}
                      </p>
                    )}
                    {item.status === 'Published' && (
                      <p className="mt-0.5 rounded-md bg-green-50 dark:bg-green-900 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-200 ring-1 ring-inset ring-green-600/20">
                        {item.status}
                      </p>
                    )}
                    {item.status === 'Scheduled' && (
                      <p className="mt-0.5 rounded-md bg-blue-50 dark:bg-blue-900 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-200 ring-1 ring-inset ring-blue-600/20">
                        {item.status}
                      </p>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-x-2 text-xs text-gray-500 dark:text-gray-400">
                    {item.publishedDate ? (
                      <>
                        <p className="whitespace-nowrap">
                          {item.status === 'Scheduled'
                            ? 'Publishes'
                            : 'Published'}{' '}
                          on{' '}
                          <time dateTime={item.publishedDateTime}>
                            {item.publishedDate}
                          </time>
                        </p>
                        <svg
                          viewBox="0 0 2 2"
                          className="h-0.5 w-0.5 fill-current"
                        >
                          <circle r={1} cx={1} cy={1} />
                        </svg>
                      </>
                    ) : (
                      <>
                        <p className="whitespace-nowrap">Not published</p>
                        <svg
                          viewBox="0 0 2 2"
                          className="h-0.5 w-0.5 fill-current"
                        >
                          <circle r={1} cx={1} cy={1} />
                        </svg>
                      </>
                    )}
                    <p className="truncate">{item.type}</p>
                    <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                      <circle r={1} cx={1} cy={1} />
                    </svg>
                    <p className="truncate">{item.itemCount} items</p>
                  </div>
                </div>
                <div className="flex flex-none items-center gap-x-4">
                  <button className="hidden rounded-md bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:block">
                    Preview
                  </button>
                  <Menu as="div" className="relative flex-none">
                    <MenuButton className="block p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <span className="sr-only">Open options</span>
                      <EllipsisVerticalIcon
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    </MenuButton>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                    >
                      <MenuItem>
                        <button className="block w-full text-left px-3 py-1 text-sm text-gray-900 dark:text-white data-focus:bg-gray-50 dark:data-focus:bg-gray-700">
                          Edit
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button className="block w-full text-left px-3 py-1 text-sm text-gray-900 dark:text-white data-focus:bg-gray-50 dark:data-focus:bg-gray-700">
                          Duplicate
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button className="block w-full text-left px-3 py-1 text-sm text-gray-900 dark:text-white data-focus:bg-gray-50 dark:data-focus:bg-gray-700">
                          {item.status === 'Published'
                            ? 'Unpublish'
                            : 'Publish'}
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button className="block w-full text-left px-3 py-1 text-sm text-red-600 dark:text-red-400 data-focus:bg-gray-50 dark:data-focus:bg-gray-700">
                          Delete
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Version 2: With Type Icons */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 2: With Content Type Icons
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul
            role="list"
            className="divide-y divide-gray-100 dark:divide-gray-700"
          >
            {contentItems.slice(0, 3).map(item => (
              <li
                key={item.id}
                className="flex items-center gap-x-4 py-4 px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    {item.type === 'trivia' && (
                      <span className="text-xl">🏒</span>
                    )}
                    {item.type === 'motivational' && (
                      <span className="text-xl">💪</span>
                    )}
                    {item.type === 'stats' && (
                      <span className="text-xl">📊</span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-x-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    {item.status === 'Published' && (
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-200">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.category} • {item.itemCount} items
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Menu as="div" className="relative">
                    <MenuButton className="block p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </MenuButton>
                    <MenuItems className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700">
                      <MenuItem>
                        <button className="block w-full text-left px-3 py-1 text-sm text-gray-900 dark:text-white data-focus:bg-gray-50 dark:data-focus:bg-gray-700">
                          View
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button className="block w-full text-left px-3 py-1 text-sm text-gray-900 dark:text-white data-focus:bg-gray-50 dark:data-focus:bg-gray-700">
                          Edit
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button className="block w-full text-left px-3 py-1 text-sm text-red-600 dark:text-red-400 data-focus:bg-gray-50 dark:data-focus:bg-gray-700">
                          Delete
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Version 3: Compact with Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 3: Compact with Quick Actions
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul
            role="list"
            className="divide-y divide-gray-100 dark:divide-gray-700"
          >
            {contentItems.map(item => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-x-4 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-x-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-x-2">
                  {item.status === 'Published' ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-200">
                      Published
                    </span>
                  ) : item.status === 'Scheduled' ? (
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-200">
                      Scheduled
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Draft
                    </span>
                  )}
                  <Menu as="div" className="relative">
                    <MenuButton className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </MenuButton>
                    <MenuItems className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700">
                      <MenuItem>
                        <button className="block w-full text-left px-3 py-1 text-sm text-gray-900 dark:text-white data-focus:bg-gray-50 dark:data-focus:bg-gray-700">
                          Edit
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button className="block w-full text-left px-3 py-1 text-sm text-red-600 dark:text-red-400 data-focus:bg-gray-50 dark:data-focus:bg-gray-700">
                          Delete
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Design Notes */}
      <section className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-3">
          💡 Usage Guide
        </h3>
        <ul className="text-xs text-purple-800 dark:text-purple-300 space-y-2">
          <li>
            • <strong>Version 1 (Full Detail):</strong> Complete information
            with preview button. Perfect for Review & Publish page.
          </li>
          <li>
            • <strong>Version 2 (With Icons):</strong> Visual content type
            indicators. Great for mixed content libraries.
          </li>
          <li>
            • <strong>Version 3 (Compact):</strong> Checkboxes for bulk actions.
            Ideal for managing large quantities of content.
          </li>
          <li>
            • All versions include dropdown menus (Edit, Delete, Publish, etc.)
          </li>
          <li>
            • Status badges use color coding (green=published, blue=scheduled,
            gray=draft)
          </li>
          <li>• Hover states improve interactivity</li>
          <li>• Fully responsive and dark mode compatible</li>
        </ul>
      </section>
    </div>
  );
}
