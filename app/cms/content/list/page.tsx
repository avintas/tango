'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Text } from '@/components/text';
import { supabase } from '@/lib/supabase';

interface SourceContent {
  id: string;
  original_text: string;
  processed_text: string | null;
  word_count: number | null;
  processing_time_ms: number | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

export default function ContentList() {
  const [contentItems, setContentItems] = useState<SourceContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<SourceContent | null>(null);

  useEffect(() => {
    fetchContentItems();
  }, []);

  const fetchContentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('source_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setContentItems(data || []);
    } catch (error) {
      console.error('Error fetching source content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = contentItems.filter(
    item =>
      item.original_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.processed_text &&
        item.processed_text.toLowerCase().includes(searchTerm.toLowerCase()))
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
            Source Content Library
          </Text>
          <Button color="indigo" href="/cms/content">
            Add New Source
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search source content by text..."
            className="w-full max-w-md"
          />
        </div>

        {/* Content grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📝</span>
            <Text className="text-xl text-gray-500 mb-2">
              {searchTerm
                ? 'No source content found matching your search'
                : 'No source content yet'}
            </Text>
            <Text className="text-gray-400 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : 'Start by adding your first source content'}
            </Text>
            {!searchTerm && (
              <Button color="indigo" href="/cms/content">
                Add Your First Source
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
                  Source Content #{item.id.slice(-8)}
                </Text>
                <Text className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {truncateText(item.original_text)}
                </Text>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {formatDate(item.created_at)}</span>
                  <span
                    className={`px-2 py-1 rounded ${
                      item.processed_text
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {item.processed_text ? 'Processed' : 'Raw'}
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
                  Source Content #{selectedItem.id.slice(-8)}
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
                {selectedItem.processed_at && (
                  <> • Processed: {formatDate(selectedItem.processed_at)}</>
                )}
              </Text>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {/* Original Text */}
                <div>
                  <Text className="font-semibold text-gray-900 mb-2">
                    Original Text
                  </Text>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {selectedItem.original_text}
                    </pre>
                  </div>
                </div>

                {/* Processed Text */}
                {selectedItem.processed_text && (
                  <div>
                    <Text className="font-semibold text-gray-900 mb-2">
                      Processed Text
                    </Text>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                        {selectedItem.processed_text}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Analytics */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedItem.word_count && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <Text className="font-semibold text-blue-900 mb-1">
                        Word Count
                      </Text>
                      <Text className="text-2xl font-bold text-blue-700">
                        {selectedItem.word_count}
                      </Text>
                    </div>
                  )}
                  {selectedItem.processing_time_ms && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <Text className="font-semibold text-purple-900 mb-1">
                        Processing Time
                      </Text>
                      <Text className="text-2xl font-bold text-purple-700">
                        {selectedItem.processing_time_ms}ms
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex space-x-4">
                <Button color="indigo">Process Text</Button>
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
