'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Text } from '@/components/text';
import { supabase } from '@/lib/supabase';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    slug: string;
  };
}

export default function ContentList() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    fetchContentItems();
  }, []);

  const fetchContentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select(
          `
          *,
          categories:content_categories(name, slug)
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setContentItems(data || []);
    } catch (error) {
      console.error('Error fetching content items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = contentItems.filter(
    item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Text className="text-gray-500">Loading content items...</Text>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Content Library
          </Text>
          <Button color="indigo" href="/cms/content">
            Create New Content
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search content by title or text..."
            className="w-full max-w-md"
          />
        </div>

        {/* Content grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📝</span>
            <Text className="text-xl text-gray-500 mb-2">
              {searchTerm
                ? 'No content found matching your search'
                : 'No content items yet'}
            </Text>
            <Text className="text-gray-400 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : 'Start by creating your first content item'}
            </Text>
            {!searchTerm && (
              <Button color="indigo" href="/cms/content">
                Create Your First Content
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <Text className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {truncateText(item.excerpt || item.content)}
                </Text>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {formatDate(item.created_at)}</span>
                  <span
                    className={`px-2 py-1 rounded ${
                      item.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content detail modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">
                  {selectedItem.title}
                </Text>
                <Button
                  plain
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              <Text className="text-sm text-gray-500 mt-1">
                Created: {formatDate(selectedItem.created_at)} • Updated:{' '}
                {formatDate(selectedItem.updated_at)}
              </Text>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {/* Content */}
                <div>
                  <Text className="font-semibold text-gray-900 mb-2">
                    Content
                  </Text>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {selectedItem.content}
                    </pre>
                  </div>
                </div>

                {/* Category */}
                {selectedItem.categories && (
                  <div>
                    <Text className="font-semibold text-gray-900 mb-2">
                      Category
                    </Text>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {selectedItem.categories.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex space-x-4">
                <Button color="indigo">Edit Content</Button>
                <Button outline>Export</Button>
                <Button plain className="text-red-600 hover:text-red-700">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
