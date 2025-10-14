'use client';

import { Heading } from '@/components/heading';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import {
  AtSymbolIcon,
  CodeBracketIcon,
  LinkIcon,
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
} from '@heroicons/react/20/solid';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TabbedEditorsTestPage() {
  const [triviaContent, setTriviaContent] = useState(
    "# NHL Records Quiz\n\n## Question 1\n\nWhat is Wayne Gretzky's career point total?\n\n**Answer:** 2,857 points"
  );
  const [motivationalContent, setMotivationalContent] = useState(
    'Even a setback can be a setup for a comeback. Stay resilient, stay focused.'
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      <div className="mb-8">
        <Heading level={1}>Tabbed Editor Components</Heading>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Testing Write/Preview tabbed editors for content creation. Perfect for
          markdown editing, content review, and form interfaces.
        </p>
      </div>

      {/* Version 1: Original Tailwind - Basic Write/Preview */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 1: Original Style - Basic Write/Preview
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <form>
            <TabGroup>
              <div className="group flex items-center">
                <TabList className="flex gap-2">
                  <Tab className="rounded-md border border-transparent bg-white dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white data-selected:bg-gray-100 dark:data-selected:bg-gray-600 data-selected:text-gray-900 dark:data-selected:text-white">
                    Write
                  </Tab>
                  <Tab className="rounded-md border border-transparent bg-white dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white data-selected:bg-gray-100 dark:data-selected:bg-gray-600 data-selected:text-gray-900 dark:data-selected:text-white">
                    Preview
                  </Tab>
                </TabList>

                {/* Toolbar - only shows in Write tab */}
                <div className="ml-auto hidden items-center space-x-5 group-has-[*:first-child[aria-selected='true']]:flex">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="-m-2.5 inline-flex size-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <span className="sr-only">Insert link</span>
                      <LinkIcon aria-hidden="true" className="size-5" />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="-m-2.5 inline-flex size-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <span className="sr-only">Insert code</span>
                      <CodeBracketIcon aria-hidden="true" className="size-5" />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="-m-2.5 inline-flex size-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <span className="sr-only">Mention someone</span>
                      <AtSymbolIcon aria-hidden="true" className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
              <TabPanels className="mt-2">
                <TabPanel className="-m-0.5 rounded-lg p-0.5">
                  <label htmlFor="comment" className="sr-only">
                    Comment
                  </label>
                  <div>
                    <textarea
                      id="comment"
                      name="comment"
                      rows={5}
                      placeholder="Add your comment..."
                      className="block w-full rounded-md bg-white dark:bg-gray-900 px-3 py-1.5 text-base text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      defaultValue={''}
                    />
                  </div>
                </TabPanel>
                <TabPanel className="-m-0.5 rounded-lg p-0.5">
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="mx-px mt-px px-3 pt-2 pb-12 text-sm text-gray-800 dark:text-gray-300">
                      Preview content will render here.
                    </div>
                  </div>
                </TabPanel>
              </TabPanels>
            </TabGroup>
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Version 2: Markdown Editor for Trivia */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 2: Markdown Editor - Trivia Content
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <TabGroup>
            <div className="flex items-center justify-between mb-4">
              <TabList className="flex gap-2">
                <Tab className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 data-selected:bg-indigo-100 dark:data-selected:bg-indigo-900 data-selected:text-indigo-700 dark:data-selected:text-indigo-300">
                  ✏️ Write
                </Tab>
                <Tab className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 data-selected:bg-indigo-100 dark:data-selected:bg-indigo-900 data-selected:text-indigo-700 dark:data-selected:text-indigo-300">
                  👁️ Preview
                </Tab>
              </TabList>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Markdown supported
              </span>
            </div>

            <TabPanels>
              <TabPanel>
                <textarea
                  value={triviaContent}
                  onChange={e => setTriviaContent(e.target.value)}
                  rows={12}
                  placeholder="Write your trivia in markdown..."
                  className="block w-full rounded-md bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 font-mono"
                />
              </TabPanel>
              <TabPanel>
                <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900 rounded-md p-4 min-h-[288px] ring-1 ring-inset ring-gray-300 dark:ring-gray-600">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {triviaContent}
                  </ReactMarkdown>
                </div>
              </TabPanel>
            </TabPanels>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{triviaContent.split(' ').length} words</span>
                <span>•</span>
                <span>{triviaContent.length} characters</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                >
                  Publish
                </button>
              </div>
            </div>
          </TabGroup>
        </div>
      </section>

      {/* Version 3: Compact Inline Editor */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 3: Compact Inline Editor - Motivational Message
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <TabGroup>
            <TabList className="flex gap-1 mb-3">
              <Tab className="rounded px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 data-selected:bg-indigo-600 data-selected:text-white">
                Edit
              </Tab>
              <Tab className="rounded px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 data-selected:bg-indigo-600 data-selected:text-white">
                Preview
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <textarea
                  value={motivationalContent}
                  onChange={e => setMotivationalContent(e.target.value)}
                  rows={4}
                  placeholder="Write your motivational message..."
                  className="block w-full rounded-md bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-indigo-600"
                />
              </TabPanel>
              <TabPanel>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-md p-4 min-h-[96px] text-sm text-gray-700 dark:text-gray-300">
                  {motivationalContent}
                </div>
              </TabPanel>
            </TabPanels>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Save
              </button>
            </div>
          </TabGroup>
        </div>
      </section>

      {/* Version 4: With Rich Toolbar */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Version 4: Full-Featured Editor with Toolbar
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <TabGroup>
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <TabList className="flex gap-1">
                  <Tab className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 data-selected:bg-white dark:data-selected:bg-gray-900 data-selected:shadow-sm data-selected:ring-1 data-selected:ring-gray-200 dark:data-selected:ring-gray-600">
                    Write
                  </Tab>
                  <Tab className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 data-selected:bg-white dark:data-selected:bg-gray-900 data-selected:shadow-sm data-selected:ring-1 data-selected:ring-gray-200 dark:data-selected:ring-gray-600">
                    Preview
                  </Tab>
                </TabList>

                {/* Rich toolbar */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-2 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Bold"
                  >
                    <span className="font-bold text-sm">B</span>
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Italic"
                  >
                    <span className="italic text-sm">I</span>
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  <button
                    type="button"
                    className="p-2 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Code"
                  >
                    <CodeBracketIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <TabPanels>
              <TabPanel>
                <textarea
                  rows={10}
                  placeholder="Write your content here..."
                  className="block w-full border-0 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0"
                  defaultValue=""
                />
              </TabPanel>
              <TabPanel>
                <div className="px-4 py-3 min-h-[240px] text-sm text-gray-700 dark:text-gray-300">
                  Preview will render here...
                </div>
              </TabPanel>
            </TabPanels>

            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Auto-saved 2 minutes ago
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </TabGroup>
        </div>
      </section>

      {/* Design Notes */}
      <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-3">
          💡 Usage Guide
        </h3>
        <ul className="text-xs text-green-800 dark:text-green-300 space-y-2">
          <li>
            • <strong>Version 1 (Original):</strong> Basic tabbed editor with
            toolbar. Good starting point for simple forms.
          </li>
          <li>
            • <strong>Version 2 (Markdown):</strong> Full markdown support with
            live preview. Perfect for trivia, stats, and content creation.
          </li>
          <li>
            • <strong>Version 3 (Compact):</strong> Minimal inline editor. Great
            for quick edits or smaller content like motivational messages.
          </li>
          <li>
            • <strong>Version 4 (Full-Featured):</strong> Complete editor with
            rich toolbar and footer actions. Best for main content editing
            pages.
          </li>
          <li>
            • Use Write/Preview tabs to let users check their markdown before
            saving
          </li>
          <li>• Toolbar buttons only show in Write tab (smart UX)</li>
          <li>
            • Character/word count and auto-save status improve user confidence
          </li>
        </ul>
      </section>
    </div>
  );
}
