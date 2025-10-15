'use client';

import { useState } from 'react';
import { Button } from '@/components/button';
import { Text } from '@/components/text';

interface CMSLayoutProps {
  children: React.ReactNode;
}

export default function CMSLayout({ children }: CMSLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { name: 'Dashboard', href: '/cms', icon: '📊' },
    { name: 'Media Library', href: '/cms/media', icon: '📁' },
    { name: 'Categories', href: '/cms/categories', icon: '🏷️' },
    { name: 'Users', href: '/cms/users', icon: '👥' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <Text className="text-xl font-bold text-indigo-600">
                Tango CMS
              </Text>
            )}
            <Button
              plain
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2"
            >
              {sidebarOpen ? '←' : '→'}
            </Button>
          </div>
        </div>

        <nav className="mt-4">
          {navigationItems.map(item => (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${
                sidebarOpen ? 'justify-start' : 'justify-center'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && (
                <span className="ml-3 font-medium">{item.name}</span>
              )}
            </a>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div
            className={`flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <Text className="text-sm font-medium text-gray-900">
                  Admin User
                </Text>
                <Text className="text-xs text-gray-500">super-admin</Text>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <Text className="text-2xl font-semibold text-gray-900">
              Content Management System
            </Text>
            <div className="flex items-center space-x-4">
              <Button outline>Settings</Button>
              <Button color="indigo">New Content</Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
