"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  PencilSquareIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalSourcedText: number;
  totalProcessedContent: number;
  recentActivity: number;
}

interface TriviaStats {
  draft?: number;
  published?: number;
  archived?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSourcedText: 0,
    totalProcessedContent: 0,
    recentActivity: 0,
  });
  const [triviaStats, setTriviaStats] = useState<TriviaStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch sourced text count
        const sourcedResponse = await fetch("/api/content-source?limit=1");
        const sourcedResult = await sourcedResponse.json();
        const sourcedCount = sourcedResult.count || 0;

        setStats({
          totalSourcedText: sourcedCount,
          totalProcessedContent: 0, // Will be implemented when processed_content API is ready
          recentActivity: sourcedCount, // For now, same as sourced text
        });

        const statsResponse = await fetch("/api/trivia-questions/stats");
        const statsResult = await statsResponse.json();
        if (statsResult.success) {
          setTriviaStats(statsResult.stats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = [
    {
      name: "Source Content",
      value: stats.totalSourcedText,
      icon: DocumentTextIcon,
      color: "bg-blue-500",
      description: "Text items ready for processing",
    },
    {
      name: "Processed Content",
      value: stats.totalProcessedContent,
      icon: CheckCircleIcon,
      color: "bg-green-500",
      description: "AI-generated content ready for export",
    },
    {
      name: "Recent Activity",
      value: stats.recentActivity,
      icon: ClockIcon,
      color: "bg-orange-500",
      description: "Items added this week",
    },
  ];

  const triviaStatCards = [
    {
      name: "Questions in Draft",
      value: triviaStats.draft || 0,
      icon: PencilSquareIcon,
      color: "bg-yellow-500",
      description: "Ready for review",
      href: "/cms/review",
    },
    {
      name: "Published Questions",
      value: triviaStats.published || 0,
      icon: BookOpenIcon,
      color: "bg-green-500",
      description: "Available in library",
      href: "/cms/trivia-questions",
    },
    {
      name: "Archived Questions",
      value: triviaStats.archived || 0,
      icon: ArchiveBoxIcon,
      color: "bg-gray-500",
      description: "Saved for later",
      href: "/cms/trivia-questions/archived",
    },
  ];

  const quickActions = [
    {
      name: "Add Source Content",
      description: "Paste and save new content for AI processing",
      href: "/cms/sourcing",
      icon: DocumentTextIcon,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      name: "Process Trivia",
      description: "Generate trivia questions from source content",
      href: "/cms/processing/trivia",
      icon: ChartBarIcon,
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Trivia Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Trivia Questions Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {triviaStatCards.map((stat) => (
            <Link href={stat.href} key={stat.name} className="block">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400">{stat.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-colors"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <action.icon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    {action.name}
                  </h4>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">Database Connection</span>
            </div>
            <span className="text-sm font-medium text-green-600">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">Authentication</span>
            </div>
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-700">AI Processing</span>
            </div>
            <span className="text-sm font-medium text-yellow-600">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
