import { Text } from '@/components/text';
import { Button } from '@/components/button';
import RLSTest from '@/components/rls-test';
import ContentProcessor from '@/components/content-processor';

export default function CMSDashboard() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your Onlyhockey.com content management system
        </p>
      </div>

      {/* Welcome section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Tango CMS
        </Text>
        <Text className="text-gray-600 mb-6">
          Manage your Onlyhockey.com content with ease. Create, edit, and
          organize hockey content for your community.
        </Text>

        <div className="flex space-x-4">
          <Button color="indigo" href="/cms/content">
            Create New Content
          </Button>
          <Button outline href="/cms/content/list">
            View All Content
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <Text className="text-2xl font-bold text-gray-900">0</Text>
              <Text className="text-gray-600">Total Content Items</Text>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">📁</span>
            </div>
            <div className="ml-4">
              <Text className="text-2xl font-bold text-gray-900">0</Text>
              <Text className="text-gray-600">Media Files</Text>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">🏷️</span>
            </div>
            <div className="ml-4">
              <Text className="text-2xl font-bold text-gray-900">0</Text>
              <Text className="text-gray-600">Categories</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </Text>
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">📊</span>
          <Text>No recent activity yet</Text>
          <Text className="text-sm">
            Start creating content to see activity here
          </Text>
        </div>
      </div>

      {/* Content Processor */}
      <ContentProcessor />

      {/* RLS Security Tests */}
      <RLSTest />
    </div>
  );
}
