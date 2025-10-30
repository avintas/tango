"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl">
          <div className="px-6 pt-6 lg:max-w-2xl lg:pr-0 lg:pl-8">
            <nav
              aria-label="Global"
              className="flex items-center justify-between lg:justify-start"
            >
              <div className="-m-1.5 p-1.5">
                <span className="sr-only">Tango CMS</span>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    Tango CMS
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 lg:hidden"
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
            </nav>
          </div>
        </div>
        <Dialog
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
          className="lg:hidden"
        >
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/cms" className="-m-1.5 p-1.5">
                <span className="sr-only">Tango CMS</span>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    Tango CMS
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="py-6">
                  <Link
                    href="/cms"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Access CMS
                  </Link>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <div className="relative">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-white lg:block"
            >
              <polygon points="0,0 90,0 50,100 0,100" />
            </svg>

            <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                <h1 className="text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-7xl">
                  Tango CMS
                </h1>
                <p className="mt-2 text-2xl font-medium text-indigo-600">
                  for Onlyhockey.com
                </p>
                <p className="mt-8 text-lg font-medium text-pretty text-gray-600 sm:text-xl/8">
                  Professional content management system for hockey trivia,
                  statistics, wisdom, greetings, and motivational content.
                  Powered by AI, built for hockey.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/cms"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Access CMS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-center justify-center">
          <Image
            alt="Hockey player in action"
            src="/gims/gim-101.webp"
            className="aspect-3/2 object-cover lg:aspect-auto lg:w-full lg:h-auto lg:max-h-full"
            width={600}
            height={400}
            priority
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Complete Content Platform
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for Onlyhockey.com
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Built specifically for hockey content management with AI-powered
              generation, multiple content types, and seamless API integration.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex-none rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xl">🤖</span>
                  </div>
                  AI-Powered Generation
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Generate trivia questions, stats, wisdom, and motivational
                    content using Google Gemini AI. Transform source content
                    into engaging hockey material automatically.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex-none rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xl">❓</span>
                  </div>
                  Trivia Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Create multiple-choice, true/false, and &quot;Who Am
                    I?&quot; questions. Build trivia sets, manage categories,
                    and publish through public APIs for Onlyhockey.com
                    integration.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex-none rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xl">📚</span>
                  </div>
                  Content Libraries
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Manage hockey statistics, wisdom quotes, daily greetings,
                    and motivational content. Each content type has dedicated
                    workflows and public API endpoints.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex-none rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                  Bulk Processing
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Process large amounts of source content, generate multiple
                    content types simultaneously, and track generation jobs in
                    real-time with detailed progress monitoring.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex-none rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xl">🔌</span>
                  </div>
                  Public APIs
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    RESTful APIs for all content types with filtering,
                    pagination, and random selection. TypeScript types included
                    for seamless Onlyhockey.com integration.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex-none rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xl">✨</span>
                  </div>
                  Content Workflows
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Review queues, approval workflows, archiving, and publishing
                    controls. Track usage and manage content lifecycle from
                    draft to published.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to manage your hockey content?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-200">
              Access the CMS and start creating trivia, stats, wisdom, and more
              for Onlyhockey.com.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/cms"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Access CMS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
