'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  TagIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

interface ReportData {
  totalTags: number;
  totalContent: number;
  totalProcessed: number;
  tagsByUsage: Array<{ label: string; count: number; color: string }>;
  contentByType: Array<{ type: string; count: number }>;
  recentActivity: Array<{ type: string; count: number; date: string }>;
  userStats: {
    totalUsers: number;
    activeUsers: number;
  };
}

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  data?: number;
  trend?: 'up' | 'down' | 'stable';
  details?: string;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchReportData = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all report data
      const [tagsResponse, contentResponse, processedResponse] =
        await Promise.all([
          fetch('/api/reports/tags', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch('/api/reports/content', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch('/api/reports/processed', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);

      const [tagsData, contentData, processedData] = await Promise.all([
        tagsResponse.json(),
        contentResponse.json(),
        processedResponse.json(),
      ]);

      // Combine all report data
      const combinedData: ReportData = {
        totalTags: tagsData.success ? tagsData.data.totalTags : 0,
        totalContent: contentData.success ? contentData.data.totalContent : 0,
        totalProcessed: processedData.success
          ? processedData.data.totalProcessed
          : 0,
        tagsByUsage: tagsData.success ? tagsData.data.tagsByUsage : [],
        contentByType: contentData.success
          ? contentData.data.contentByType
          : [],
        recentActivity: contentData.success
          ? contentData.data.recentActivity
          : [],
        userStats: {
          totalUsers: 1, // Placeholder - would need user management
          activeUsers: 1,
        },
      };

      setReportData(combinedData);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const reportCards: ReportCard[] = [
    {
      id: 'total-tags',
      title: 'Total Tags',
      description: 'Content classification tags available',
      icon: TagIcon,
      color: 'bg-blue-500',
      data: reportData?.totalTags,
    },
    {
      id: 'total-content',
      title: 'Source Content',
      description: 'Raw content pieces in database',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      data: reportData?.totalContent,
    },
    {
      id: 'total-processed',
      title: 'Processed Content',
      description: 'AI-processed content ready for export',
      icon: ArchiveBoxIcon,
      color: 'bg-purple-500',
      data: reportData?.totalProcessed,
    },
    {
      id: 'active-users',
      title: 'Active Users',
      description: 'Users with access to CMS',
      icon: UserIcon,
      color: 'bg-indigo-500',
      data: reportData?.userStats.activeUsers,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">
          Reports & Analytics
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your content management system performance and usage
          statistics.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            System Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportCards.map(card => (
              <div
                key={card.id}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`${card.color} rounded-md p-2`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.data || 0}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tag Usage Report */}
      {reportData?.tagsByUsage && reportData.tagsByUsage.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Tag Usage Statistics
            </h3>
            <div className="space-y-3">
              {reportData.tagsByUsage.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-gray-900">
                      {tag.label}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {tag.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Type Distribution */}
      {reportData?.contentByType && reportData.contentByType.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Content Type Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportData.contentByType.map((type, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {type.type.replace('_source', '')}
                      </p>
                      <p className="text-sm text-gray-500">Content pieces</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {type.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {reportData?.recentActivity && reportData.recentActivity.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity (Last 7 Days)
            </h3>
            <div className="space-y-3">
              {reportData.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {activity.type.replace('_source', '')} content
                      </p>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {activity.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Export Reports
          </h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700">
              Export to CSV
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700">
              Export to JSON
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700">
              Generate PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
