'use client';

import {
  BellIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  NewspaperIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';

const navigation = [
  {
    name: 'Dashboard',
    href: '/cms',
    icon: ComputerDesktopIcon,
  },
  {
    name: 'Sourcing',
    href: '/cms/sourcing',
    icon: NewspaperIcon,
  },
  {
    name: 'Content',
    href: '/cms/content',
    icon: DocumentTextIcon,
  },
  {
    name: 'Processing',
    href: '/cms/processing',
    icon: BeakerIcon,
  },
  {
    name: 'Review & Publish',
    href: '/cms/review',
    icon: ArchiveBoxIcon,
  },
  {
    name: 'Testing',
    href: '/testing',
    icon: WrenchScrewdriverIcon,
  },
];

const promptActions = [
  {
    id: 1,
    name: 'Prompt Constructor',
    href: '/cms/prompt-constructor',
    initial: 'P',
  },
  {
    id: 2,
    name: 'Stats Generator',
    href: '/cms/stats-generator',
    initial: 'S',
  },
  {
    id: 3,
    name: 'Stories Generator',
    href: '/cms/stories-generator',
    initial: 'S',
  },
  {
    id: 4,
    name: 'HUGs Generator',
    href: '/cms/hugs-generator',
    initial: 'H',
  },
  {
    id: 5,
    name: 'Motivational Generator',
    href: '/cms/motivational-generator',
    initial: 'M',
  },
  {
    id: 6,
    name: 'Variables',
    href: '/cms/prompt-variables',
    initial: 'V',
  },
];

const triviaSetsActions = [
  {
    id: 1,
    name: 'All TriviaSets',
    href: '/trivia-sets',
    initial: 'A',
  },
  {
    id: 2,
    name: 'Categories',
    href: '/trivia-sets/categories',
    initial: 'C',
  },
  {
    id: 3,
    name: 'Recent',
    href: '/trivia-sets/recent',
    initial: 'R',
  },
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
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex w-72 flex-col bg-gray-900">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 py-4">
          <div className="flex h-14 shrink-0 items-center">
            <div className="flex items-center space-x-2">
              <div className="relative h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold text-xs select-none">
                  T
                </span>
              </div>
              <span className="text-base font-bold text-white">Tango CMS</span>
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
                            'group flex gap-x-2 rounded-md p-1.5 text-xs font-medium'
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className="size-4 shrink-0"
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  TriviaSets
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {triviaSetsActions.map(action => (
                    <li key={action.name}>
                      <Link
                        href={action.href}
                        className="group flex gap-x-2 rounded-md p-1.5 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white"
                      >
                        <span className="flex size-4 shrink-0 items-center justify-center rounded border border-gray-700 bg-gray-800 text-[9px] font-medium text-gray-400 group-hover:text-white">
                          {action.initial}
                        </span>
                        <span className="truncate">{action.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Prompts
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {promptActions.map(action => (
                    <li key={action.name}>
                      <Link
                        href={action.href}
                        className="group flex gap-x-2 rounded-md p-1.5 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white"
                      >
                        <span className="flex size-4 shrink-0 items-center justify-center rounded border border-gray-700 bg-gray-800 text-[9px] font-medium text-gray-400 group-hover:text-white">
                          {action.initial}
                        </span>
                        <span className="truncate">{action.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* User Section */}
              <li className="mt-auto">
                <div className="flex items-center gap-x-3 px-2 py-2 text-xs font-medium text-gray-400">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-[10px] font-medium">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-white text-xs">
                      {user?.email?.split('@')[0] || 'Admin'}
                    </div>
                    <div className="truncate text-[10px] text-gray-400">
                      {user?.email || 'admin@tango.com'}
                    </div>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-1 text-gray-400 hover:text-white"
                    title="Sign out"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-3">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
