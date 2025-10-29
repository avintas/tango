"use client";

import { Fragment } from "react";
import { TriviaSet } from "@/lib/supabase";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function SetPreviewPanel({
  set,
  open,
  onClose,
}: {
  set: TriviaSet | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!set) return null;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          {set.title}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <div className="prose">
                        <p>{set.description}</p>
                      </div>
                      <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Theme:</dt>
                          <dd className="font-medium text-gray-900">
                            {set.theme}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Questions:</dt>
                          <dd className="font-medium text-gray-900">
                            {set.question_count}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Status:</dt>
                          <dd className="font-medium text-gray-900 capitalize">
                            {set.status}
                          </dd>
                        </div>
                        {set.tags && set.tags.length > 0 && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Tags:</dt>
                            <dd className="font-medium text-gray-900">
                              {set.tags.join(", ")}
                            </dd>
                          </div>
                        )}
                      </dl>
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <Link
                          href={`/cms/trivia-sets/edit/${set.id}`}
                          className="flex w-full items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Edit Set
                        </Link>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
