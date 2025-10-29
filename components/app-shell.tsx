"use client";

import {
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  {
    name: "Dashboard",
    href: "/cms",
    icon: ComputerDesktopIcon,
  },
  {
    name: "Review & Publish",
    href: "/cms/review",
    icon: ArchiveBoxIcon,
  },
];

const libraryActions = [
  {
    id: 1,
    name: "Sourcing",
    href: "/cms/sourcing",
    initial: "S",
  },
  {
    id: 2,
    name: "Source Library",
    href: "/cms/library",
    initial: "L",
  },
  {
    id: 3,
    name: "Prompt Creation",
    href: "/cms/prompts/create",
    initial: "C",
  },
  {
    id: 4,
    name: "Prompts Library",
    href: "/cms/prompts-library",
    initial: "P",
  },
];

const contentLibrariesActions = [
  {
    id: 1,
    name: "Trivia Questions",
    href: "/cms/trivia-questions",
    initial: "❓",
  },
  {
    id: 6,
    name: "Archived Questions",
    href: "/cms/trivia-questions/archived",
    initial: "🗄️",
  },
  {
    id: 2,
    name: "Stats Library",
    href: "/cms/stats-library",
    initial: "📊",
  },
  {
    id: 3,
    name: "Motivational Library",
    href: "/cms/motivational-library",
    initial: "💪",
  },
  {
    id: 4,
    name: "Greetings Library",
    href: "/cms/greetings-library",
    initial: "👋",
  },
  {
    id: 5,
    name: "Wisdom Library",
    href: "/cms/wisdom-library",
    initial: "🤔",
  },
];

const triviaSetsActions = [
  {
    id: 1,
    name: "All Sets",
    href: "/cms/trivia-sets",
    initial: "📋",
  },
  {
    id: 2,
    name: "Create New Set",
    href: "/cms/trivia-sets/create",
    initial: "🆕",
  },
  {
    id: 3,
    name: "Published",
    href: "/cms/trivia-sets/published",
    initial: "✅",
  },
  {
    id: 4,
    name: "Drafts",
    href: "/cms/trivia-sets/drafts",
    initial: "📝",
  },
];

const processingActions = [
  {
    id: 0,
    name: "The Main Generator",
    href: "/cms/processing/main-generator",
    initial: "⚡",
  },
  {
    id: 1,
    name: "Trivia Set Generator",
    href: "/cms/processing/trivia-set-generator",
    initial: "🧩",
  },
];

const managementActions = [
  {
    id: 1,
    name: "Categories",
    href: "/cms/categories",
    initial: "🏷️",
  },
  {
    id: 2,
    name: "Hero Collections",
    href: "/cms/hero-collections",
    initial: "🌟",
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({
  children,
  title = "Tango CMS",
}: AppShellProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="flex w-72 flex-col bg-gray-50 border-r border-gray-200">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-4 py-4">
          <div className="flex h-14 shrink-0 items-center px-2">
            <div className="flex items-center space-x-2">
              <div className="relative h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold text-xs select-none">
                  T
                </span>
              </div>
              <span className="text-base font-bold text-gray-800">
                Tango CMS
              </span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            isActive
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-gray-600 hover:bg-gray-200 hover:text-gray-900",
                            "group flex gap-x-3 rounded-md p-1 text-xs font-semibold",
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0"
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  Library
                </div>
                <ul role="list" className="mt-2 space-y-1">
                  {libraryActions.map((action) => (
                    <li key={action.name}>
                      <Link
                        href={action.href}
                        className="group flex gap-x-3 rounded-md p-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-[10px] font-medium text-gray-600 group-hover:text-gray-900">
                          {action.initial}
                        </span>
                        <span className="truncate">{action.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  Processing
                </div>
                <ul role="list" className="mt-2 space-y-1">
                  {processingActions.map((action) => (
                    <li key={action.name}>
                      <Link
                        href={action.href}
                        className="group flex gap-x-3 rounded-md p-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-[10px] font-medium text-gray-600 group-hover:text-gray-900">
                          {action.initial}
                        </span>
                        <span className="truncate">{action.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  Content Libraries
                </div>
                <ul role="list" className="mt-2 space-y-1">
                  {contentLibrariesActions.map((action) => (
                    <li key={action.name}>
                      <Link
                        href={action.href}
                        className="group flex gap-x-3 rounded-md p-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-sm">
                          {action.initial}
                        </span>
                        <span className="truncate">{action.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  Trivia Sets
                </div>
                <ul role="list" className="mt-2 space-y-1">
                  {triviaSetsActions.map((action) => (
                    <li key={action.name}>
                      <Link
                        href={action.href}
                        className="group flex gap-x-3 rounded-md p-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-sm">
                          {action.initial}
                        </span>
                        <span className="truncate">{action.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  Management
                </div>
                <ul role="list" className="mt-2 space-y-1">
                  {managementActions.map((action) => (
                    <li key={action.name}>
                      <Link
                        href={action.href}
                        className="group flex gap-x-3 rounded-md p-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-sm">
                          {action.initial}
                        </span>
                        <span className="truncate">{action.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* User Section */}
              <li className="mt-auto -mx-2">
                <div className="flex items-center gap-x-3 p-2 text-sm font-medium text-gray-600">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 text-xs font-medium">
                      {user?.email?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-gray-800 font-semibold text-sm">
                      {user?.email?.split("@")[0] || "Admin"}
                    </div>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-1 text-gray-500 hover:text-gray-800"
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
        <header className="bg-white border-b border-gray-200">
          <div className="px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
