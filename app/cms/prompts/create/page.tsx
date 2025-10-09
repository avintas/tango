'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import PromptFeed from '@/components/prompt-feed';

interface Category {
  id: number;
  name: string;
  content_types: string[];
}

interface CreatePromptData {
  name: string;
  description: string;
  prompt_text: string;
  content_type: string;
  ai_service: string;
  category_id: number;
}

export default function CreatePromptPage() {
  const [formData, setFormData] = useState<CreatePromptData>({
    name: '',
    description: '',
    prompt_text: '',
    content_type: 'article',
    ai_service: 'gemini',
    category_id: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [feedRefresh, setFeedRefresh] = useState(0);
  const { session } = useAuth();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.access_token) return;

      try {
        const response = await fetch('/api/categories', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();
        if (result.success) {
          setCategories(result.data || []);
          // Set first category as default if none selected
          if (result.data?.length > 0 && formData.category_id === 0) {
            setFormData(prev => ({ ...prev, category_id: result.data[0].id }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, [session, formData.category_id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category_id' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.prompt_text.trim()) {
      setSaveStatus('❌ Name and prompt text are required.');
      return;
    }

    if (formData.category_id === 0) {
      setSaveStatus('❌ Please select a category.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('Saving prompt template...');

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus('✅ Prompt template saved successfully!');
        // Refresh the feed to show the new prompt
        setFeedRefresh(prev => prev + 1);
        // Clear form after successful save
        setTimeout(() => {
          setFormData({
            name: '',
            description: '',
            prompt_text: '',
            content_type: 'article',
            ai_service: 'gemini',
            category_id: categories[0]?.id || 0,
          });
          setSaveStatus('');
        }, 2000);
      } else {
        setSaveStatus(`❌ Save failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setSaveStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create Prompt Template
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Template Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
                placeholder="e.g., Halloween Hockey Traditions"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
                placeholder="Brief description of what this prompt generates"
              />
            </div>

            {/* Content Type */}
            <div>
              <label
                htmlFor="content_type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Content Type
              </label>
              <select
                id="content_type"
                name="content_type"
                value={formData.content_type}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                <option value="article">Article</option>
                <option value="trivia_multiple_choice">
                  Trivia (Multiple Choice)
                </option>
                <option value="trivia_true_false">Trivia (True/False)</option>
                <option value="quote">Quote</option>
                <option value="story">Story</option>
                <option value="hugs">H.U.G.s</option>
                <option value="lore">Lore</option>
              </select>
            </div>

            {/* AI Service */}
            <div>
              <label
                htmlFor="ai_service"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                AI Service
              </label>
              <select
                id="ai_service"
                name="ai_service"
                value={formData.ai_service}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
              >
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
                <option value="gpt4">GPT-4</option>
                <option value="deepseek">DeepSeek</option>
                <option value="grok">Grok</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
                required
              >
                <option value={0}>Select a category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt Text */}
            <div>
              <label
                htmlFor="prompt_text"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Prompt Text *
              </label>
              <textarea
                id="prompt_text"
                name="prompt_text"
                rows={8}
                value={formData.prompt_text}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-400 bg-gray-50 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-white text-sm p-3"
                placeholder="Write your prompt here. Be specific about what you want the AI to generate..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Create Prompt Template'}
              </button>

              {formData.name && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      description: '',
                      prompt_text: '',
                      content_type: 'article',
                      ai_service: 'gemini',
                      category_id: categories[0]?.id || 0,
                    });
                    setSaveStatus('');
                  }}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Message */}
            {saveStatus && (
              <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {saveStatus}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Recent Prompts Feed */}
      <div className="max-w-4xl mx-auto">
        <PromptFeed refreshTrigger={feedRefresh} />
      </div>
    </div>
  );
}
