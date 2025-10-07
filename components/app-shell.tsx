'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  DocumentTextIcon,
  FolderIcon,
  HomeIcon,
  PhotoIcon,
  TagIcon,
  UserGroupIcon,
  XMarkIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/cms', icon: HomeIcon },
  { name: 'Source Creator', href: '/cms/source', icon: ClipboardDocumentIcon },
  {
    name: 'Source Analysis',
    href: '/cms/source/analysis',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Source Processor',
    href: '/cms/source-processor',
    icon: ArchiveBoxIcon,
  },
  { name: 'Users', href: '/cms/users', icon: UserGroupIcon },
  { name: 'Reports', href: '/cms/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/cms/settings', icon: Cog6ToothIcon },
];

const quickActions = [
  { id: 1, name: 'Source Creator', href: '/cms/source', initial: 'S' },
  { id: 2, name: 'View Landing', href: '/cms-landing', initial: 'L' },
  { id: 3, name: 'Home Page', href: '/', initial: 'H' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({
  children,
  title = 'Tango CMS',
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div>
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>

              {/* Mobile Sidebar */}
              <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                <div className="relative flex h-16 shrink-0 items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                    <span className="text-xl font-bold text-white">
                      Tango CMS
                    </span>
                  </div>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map(item => {
                          const isActive = pathname === item.href;
                          return (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={classNames(
                                  isActive
                                    ? 'bg-white/5 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                  'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold'
                                )}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <item.icon
                                  aria-hidden="true"
                                  className="size-6 shrink-0"
                                />
                                {item.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                    <li>
                      <div className="text-xs/6 font-semibold text-gray-400">
                        Quick Actions
                      </div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {quickActions.map(action => (
                          <li key={action.name}>
                            <Link
                              href={action.href}
                              className="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
                              onClick={() => setSidebarOpen(false)}
                            >
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:border-white/20 group-hover:text-white">
                                {action.initial}
                              </span>
                              <span className="truncate">{action.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden bg-gray-900 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6">
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-bold text-white">Tango CMS</span>
              </div>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map(item => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={classNames(
                              isActive
                                ? 'bg-white/5 text-white'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold'
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className="size-6 shrink-0"
                            />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li>
                  <div className="text-xs/6 font-semibold text-gray-400">
                    Quick Actions
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {quickActions.map(action => (
                      <li key={action.name}>
                        <Link
                          href={action.href}
                          className="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                            {action.initial}
                          </span>
                          <span className="truncate">{action.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-400 hover:text-white lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div className="flex-1 text-sm/6 font-semibold text-white">
            {title}
          </div>
          <div className="flex items-center gap-x-4">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="size-6" />
            </button>
            <div className="flex items-center gap-x-3">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Admin</span>
                <span className="text-xs text-gray-400">admin@tango.com</span>
              </div>
            </div>
          </div>
        </div>

        <main className="pt-0 pb-0 lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </>
  );
}
