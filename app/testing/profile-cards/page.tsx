'use client';

import { Heading } from '@/components/heading';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/20/solid';
import {
  sampleTriviaSet,
  sampleMotivational,
  sampleStats,
} from '@/lib/fixtures/sample-trivia';

// Mock profile data for testing different layouts
const triviaProfile = {
  name: 'NHL Records Daily Quiz',
  subtitle: 'Trivia Set',
  avatar: '/gims/gim-100.jpg',
  backgroundImage: '/gims/gim-102.JPG',
  category: 'Daily Quiz',
  contentType: 'Trivia',
  fields: [
    ['Content Type', 'Trivia Questions'],
    ['Category', 'daily-quiz'],
    ['Status', 'Published'],
    ['Questions', '3 items'],
    ['Published', 'Oct 14, 2025'],
    ['Created By', 'Admin'],
  ],
};

const motivationalProfile = {
  name: 'Monday Motivation',
  subtitle: 'Comeback Stories',
  avatar: '/gims/gim-101.webp',
  backgroundImage: '/gims/gim-100.jpg',
  category: 'Monday Motivation',
  contentType: 'Motivational',
  fields: [
    ['Content Type', 'Motivational Message'],
    ['Category', 'monday-motivation'],
    ['Status', 'Published'],
    ['Theme', 'Resilience & Comebacks'],
    ['Published', 'Oct 14, 2025'],
    ['Word Count', '87 words'],
  ],
};

export default function ProfileCardsTestPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-16">
      <div className="mb-8">
        <Heading level={1}>Profile Card Layouts</Heading>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Testing profile-style cards for content display. Adapted from Tailwind
          UI components.
        </p>
      </div>

      {/* Version 1: Original Tailwind Style - Trivia */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Version 1: Original Tailwind Profile (Trivia Content)
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            alt=""
            src={triviaProfile.backgroundImage}
            className="h-32 w-full object-cover lg:h-48"
          />
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
              <div className="flex">
                <img
                  alt=""
                  src={triviaProfile.avatar}
                  className="size-24 rounded-full ring-4 ring-white dark:ring-gray-900 sm:size-32"
                />
              </div>
              <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                  <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
                    {triviaProfile.name}
                  </h1>
                </div>
                <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <EnvelopeIcon
                      aria-hidden="true"
                      className="mr-1.5 -ml-0.5 size-5 text-gray-400"
                    />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                  >
                    <PhoneIcon
                      aria-hidden="true"
                      className="mr-1.5 -ml-0.5 size-5"
                    />
                    <span>Publish</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
              <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
                {triviaProfile.name}
              </h1>
            </div>

            {/* Fields/Metadata */}
            <div className="mt-6 pb-8">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                {triviaProfile.fields.map(([label, value]) => (
                  <div key={label} className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Version 2: Simplified - Motivational */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Version 2: Simplified Profile (Motivational Content)
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="relative h-32 bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <div className="mx-auto max-w-5xl px-6">
            <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
              <div className="flex">
                <div className="size-24 rounded-full bg-white dark:bg-gray-800 ring-4 ring-white dark:ring-gray-900 sm:size-32 flex items-center justify-center text-4xl">
                  💪
                </div>
              </div>
              <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                <div className="mt-6 min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {motivationalProfile.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {motivationalProfile.subtitle}
                  </p>
                </div>
                <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-purple-500"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Compact metadata */}
            <div className="mt-6 pb-8">
              <div className="flex flex-wrap gap-3">
                {motivationalProfile.fields
                  .slice(0, 4)
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {label}:{' '}
                      </span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Version 3: Card Stack */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Version 3: Compact Card Stack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trivia Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="h-24 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="size-16 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-2xl">
                  🏒
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {triviaProfile.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {triviaProfile.category}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full font-medium">
                  Published
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  3 questions
                </span>
              </div>
            </div>
          </div>

          {/* Motivational Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="h-24 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="size-16 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-2xl">
                  💪
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {motivationalProfile.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {motivationalProfile.category}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full font-medium">
                  Published
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  87 words
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notes Section */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
          💡 Design Notes
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-2">
          <li>
            • <strong>Version 1:</strong> Full profile layout with avatar,
            background, metadata grid. Best for detailed content pages.
          </li>
          <li>
            • <strong>Version 2:</strong> Simplified with gradient background
            and compact metadata pills. Good for overview pages.
          </li>
          <li>
            • <strong>Version 3:</strong> Compact cards in a grid. Perfect for
            browsing multiple content items at once.
          </li>
          <li>• All versions support dark mode and are fully responsive</li>
          <li>
            • Replace avatar images with hockey-themed icons or actual content
            thumbnails
          </li>
        </ul>
      </section>
    </div>
  );
}
