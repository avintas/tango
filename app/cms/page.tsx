'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalSourcedText: number;
  totalProcessedContent: number;
  totalPromptTemplates: number;
  recentActivity: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSourcedText: 0,
    totalProcessedContent: 0,
    totalPromptTemplates: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch sourced text count
        const sourcedResponse = await fetch('/api/sourced-text?limit=1', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const sourcedResult = await sourcedResponse.json();
        const sourcedCount = sourcedResult.count || 0;

        // Fetch prompt templates count
        const promptsResponse = await fetch('/api/prompts?limit=1', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const promptsResult = await promptsResponse.json();
        const promptsCount = promptsResult.count || 0;

        setStats({
          totalSourcedText: sourcedCount,
          totalProcessedContent: 0, // Will be implemented when processed_content API is ready
          totalPromptTemplates: promptsCount,
          recentActivity: sourcedCount, // For now, same as sourced text
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [session]);

  const statCards = [
    {
      name: 'Source Content',
      value: stats.totalSourcedText,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      description: 'Text items ready for processing',
    },
    {
      name: 'Processed Content',
      value: stats.totalProcessedContent,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      description: 'AI-generated content ready for export',
    },
    {
      name: 'Prompt Templates',
      value: stats.totalPromptTemplates,
      icon: CogIcon,
      color: 'bg-purple-500',
      description: 'AI prompts ready for use',
    },
    {
      name: 'Recent Activity',
      value: stats.recentActivity,
      icon: ClockIcon,
      color: 'bg-orange-500',
      description: 'Items added this week',
    },
  ];

  const quickActions = [
    {
      name: 'Add Source Content',
      description: 'Paste and save new content for AI processing',
      href: '/cms/sourcing',
      icon: DocumentTextIcon,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    {
      name: 'Create Prompt Template',
      description: 'Build AI prompts for content generation',
      href: '/cms/prompts/create',
      icon: CogIcon,
      color:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(stat => (
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
          {quickActions.map(action => (
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
