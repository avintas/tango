'use client';

import {
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';

const navigation = [
  {
    name: 'Dashboard',
    href: '/cms',
    icon: ArchiveBoxIcon,
  },
  {
    name: 'Sourcing',
    href: '/cms/sourcing',
    icon: ArchiveBoxIcon,
  },
  {
    name: 'Processing',
    href: '/cms/processing',
    icon: ArchiveBoxIcon,
  },
  {
    name: 'Tags',
    href: '/cms/tags',
    icon: TagIcon,
  },
  { name: 'Reports', href: '/cms/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/cms/settings', icon: Cog6ToothIcon },
];

const promptActions = [
  {
    id: 1,
    name: 'Create Prompt',
    href: '/cms/prompts/create',
    initial: 'C',
  },
];

const quickActions = [
  {
    id: 1,
    name: 'Sourcing',
    href: '/cms/sourcing',
    initial: 'S',
  },
  { id: 2, name: 'Home Page', href: '/', initial: 'H' },
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
              <li>
                <div className="text-xs/6 font-semibold text-gray-400">
                  Prompts
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {promptActions.map(action => (
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

              {/* User Section */}
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm/6 font-semibold leading-6 text-gray-400">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-white">
                      {user?.email?.split('@')[0] || 'Admin'}
                    </div>
                    <div className="truncate text-xs text-gray-400">
                      {user?.email || 'admin@tango.com'}
                    </div>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-1 text-gray-400 hover:text-white"
                    title="Sign out"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
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
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
