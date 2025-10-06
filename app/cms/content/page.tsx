'use client';

import { useState } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Text } from '@/components/text';

export default function ContentEditor() {
  const [activeTab, setActiveTab] = useState('content-library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const tabs = [
    { id: 'content-library', name: 'Content Library', icon: '📚' },
    { id: 'media-library', name: 'Media Library', icon: '🖼️' },
    { id: 'categories', name: 'Categories', icon: '🏷️' },
  ];

  // Mock data for content library
  const contentItems = [
    {
      id: '1',
      title: 'Wayne Gretzky Records',
      content:
        'Wayne Gretzky holds numerous NHL records including most goals, assists, and points in a career...',
      status: 'published',
      created_at: '2024-01-15',
      word_count: 245,
    },
    {
      id: '2',
      title: 'Hockey Trivia Facts',
      content: 'The Stanley Cup is the oldest trophy in professional sports...',
      status: 'draft',
      created_at: '2024-01-14',
      word_count: 189,
    },
    {
      id: '3',
      title: 'NHL History',
      content: 'The National Hockey League was founded in 1917...',
      status: 'published',
      created_at: '2024-01-13',
      word_count: 312,
    },
  ];

  // Mock data for media library
  const mediaItems = [
    {
      id: '1',
      name: 'gretzky-action.jpg',
      type: 'image',
      size: '2.4 MB',
      uploaded_at: '2024-01-15',
      url: '/gims/gim-100.jpg',
    },
    {
      id: '2',
      name: 'hockey-rink.webp',
      type: 'image',
      size: '1.8 MB',
      uploaded_at: '2024-01-14',
      url: '/gims/gim-101.webp',
    },
    {
      id: '3',
      name: 'stanley-cup.JPG',
      type: 'image',
      size: '3.2 MB',
      uploaded_at: '2024-01-13',
      url: '/gims/gim-102.JPG',
    },
  ];

  // Mock data for categories
  const categoryItems = [
    {
      id: '1',
      name: 'Trivia',
      slug: 'trivia',
      description: 'Hockey trivia questions and facts',
      color: 'blue',
      content_count: 15,
      created_at: '2024-01-10',
    },
    {
      id: '2',
      name: 'History',
      slug: 'history',
      description: 'Historical hockey moments and records',
      color: 'green',
      content_count: 8,
      created_at: '2024-01-09',
    },
    {
      id: '3',
      name: 'Players',
      slug: 'players',
      description: 'Player profiles and achievements',
      color: 'purple',
      content_count: 22,
      created_at: '2024-01-08',
    },
    {
      id: '4',
      name: 'Teams',
      slug: 'teams',
      description: 'Team information and statistics',
      color: 'red',
      content_count: 12,
      created_at: '2024-01-07',
    },
  ];

  const filteredContent = contentItems.filter(
    item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMedia = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categoryItems.filter(
    item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Editor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage content library and media files for Onlyhockey.com
        </p>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Search bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === 'content-library' ? 'content' : activeTab === 'media-library' ? 'media' : 'categories'}...`}
            className="w-full"
          />
        </div>
        <Button color="indigo">
          {activeTab === 'content-library'
            ? 'Add Content'
            : activeTab === 'media-library'
              ? 'Upload Media'
              : 'Add Category'}
        </Button>
      </div>

      {/* Content Library Tab */}
      {activeTab === 'content-library' && (
        <div className="space-y-6">
          {/* Content grid */}
          {filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📚</span>
              <Text className="text-xl text-gray-500 mb-2">
                {searchTerm
                  ? 'No content found matching your search'
                  : 'No content items yet'}
              </Text>
              <Text className="text-gray-400 mb-6">
                {searchTerm
                  ? 'Try a different search term'
                  : 'Start by adding your first content item'}
              </Text>
              {!searchTerm && (
                <Button color="indigo">Add Your First Content</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map(item => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedContent(item)}
                >
                  <Text className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {item.content}
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
                  <div className="mt-2 text-xs text-gray-400">
                    {item.word_count} words
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media Library Tab */}
      {activeTab === 'media-library' && (
        <div className="space-y-6">
          {/* Media grid */}
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🖼️</span>
              <Text className="text-xl text-gray-500 mb-2">
                {searchTerm
                  ? 'No media found matching your search'
                  : 'No media files yet'}
              </Text>
              <Text className="text-gray-400 mb-6">
                {searchTerm
                  ? 'Try a different search term'
                  : 'Start by uploading your first media file'}
              </Text>
              {!searchTerm && (
                <Button color="indigo">Upload Your First Media</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMedia.map(item => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                      {item.name}
                    </div>
                  </div>
                  <Text className="font-medium text-gray-900 mb-1 truncate">
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {item.size} • {formatDate(item.uploaded_at)}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Categories grid */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🏷️</span>
              <Text className="text-xl text-gray-500 mb-2">
                {searchTerm
                  ? 'No categories found matching your search'
                  : 'No categories yet'}
              </Text>
              <Text className="text-gray-400 mb-6">
                {searchTerm
                  ? 'Try a different search term'
                  : 'Start by creating your first category'}
              </Text>
              {!searchTerm && (
                <Button color="indigo">Create Your First Category</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map(category => (
                <div
                  key={category.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-4 h-4 rounded-full bg-${category.color}-500`}
                    ></div>
                    <span className="text-xs text-gray-500">
                      {category.content_count} items
                    </span>
                  </div>
                  <Text className="font-semibold text-gray-900 mb-2">
                    {category.name}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {category.description}
                  </Text>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {formatDate(category.created_at)}</span>
                    <span className="text-gray-400">/{category.slug}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">
                  {selectedContent.title}
                </Text>
                <Button
                  plain
                  onClick={() => setSelectedContent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              <Text className="text-sm text-gray-500 mt-1">
                Created: {formatDate(selectedContent.created_at)} •{' '}
                {selectedContent.word_count} words
              </Text>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div>
                  <Text className="font-semibold text-gray-900 mb-2">
                    Content
                  </Text>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {selectedContent.content}
                    </pre>
                  </div>
                </div>
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

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">
                  {selectedMedia.name}
                </Text>
                <Button
                  plain
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              <Text className="text-sm text-gray-500 mt-1">
                {selectedMedia.size} • Uploaded:{' '}
                {formatDate(selectedMedia.uploaded_at)}
              </Text>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-gray-500 text-sm">
                    {selectedMedia.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex space-x-4">
                <Button color="indigo">Edit Media</Button>
                <Button outline>Download</Button>
                <Button plain className="text-red-600 hover:text-red-700">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full bg-${selectedCategory.color}-500`}
                  ></div>
                  <Text className="text-xl font-bold text-gray-900">
                    {selectedCategory.name}
                  </Text>
                </div>
                <Button
                  plain
                  onClick={() => setSelectedCategory(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              <Text className="text-sm text-gray-500 mt-1">
                Created: {formatDate(selectedCategory.created_at)} •{' '}
                {selectedCategory.content_count} items
              </Text>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div>
                  <Text className="font-semibold text-gray-900 mb-2">
                    Description
                  </Text>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <Text className="text-sm text-gray-700">
                      {selectedCategory.description}
                    </Text>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <Text className="font-semibold text-blue-900 mb-1">
                      Slug
                    </Text>
                    <Text className="text-sm text-blue-700 font-mono">
                      /{selectedCategory.slug}
                    </Text>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <Text className="font-semibold text-green-900 mb-1">
                      Content Items
                    </Text>
                    <Text className="text-2xl font-bold text-green-700">
                      {selectedCategory.content_count}
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex space-x-4">
                <Button color="indigo">Edit Category</Button>
                <Button outline>View Content</Button>
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
