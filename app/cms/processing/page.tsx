'use client';

import { useReducer } from 'react';
import { useAuth } from '@/lib/auth-context';

// State interface
interface ProcessingState {
  selectedCard: string;
  promptContent: string;
  sourceContent: string;
  isGenerating: boolean;
  generatedContent: string;
  generationError: string;
}

// Action types
type ProcessingAction =
  | { type: 'SET_SELECTED_CARD'; payload: string }
  | { type: 'SET_PROMPT_CONTENT'; payload: string }
  | { type: 'SET_SOURCE_CONTENT'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_GENERATED_CONTENT'; payload: string }
  | { type: 'SET_GENERATION_ERROR'; payload: string };

// Initial state
const initialState: ProcessingState = {
  selectedCard: 'trivia_sets',
  promptContent: '',
  sourceContent: '',
  isGenerating: false,
  generatedContent: '',
  generationError: '',
};

// Reducer function
function processingReducer(
  state: ProcessingState,
  action: ProcessingAction
): ProcessingState {
  switch (action.type) {
    case 'SET_SELECTED_CARD':
      return { ...state, selectedCard: action.payload };
    case 'SET_PROMPT_CONTENT':
      return { ...state, promptContent: action.payload };
    case 'SET_SOURCE_CONTENT':
      return { ...state, sourceContent: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_GENERATED_CONTENT':
      return { ...state, generatedContent: action.payload };
    case 'SET_GENERATION_ERROR':
      return { ...state, generationError: action.payload };
    default:
      return state;
  }
}

export default function ProcessingPage() {
  const [state, dispatch] = useReducer(processingReducer, initialState);
  const { session } = useAuth();

  // Content type cards
  const contentTypes = [
    {
      id: 'trivia_sets',
      name: 'Trivia Sets',
      description: 'Daily trivia questions',
      icon: '🎯',
      color: 'bg-purple-500',
    },
    {
      id: 'statistics',
      name: 'Statistics',
      description: 'Statistical data',
      icon: '📊',
      color: 'bg-green-500',
    },
    {
      id: 'lore',
      name: 'Lore',
      description: 'Stories and legends',
      icon: '📚',
      color: 'bg-yellow-500',
    },
    {
      id: 'motivational',
      name: 'Motivational',
      description: 'Inspirational content',
      icon: '💪',
      color: 'bg-pink-500',
    },
    {
      id: 'greetings',
      name: 'Greetings',
      description: 'Welcome messages',
      icon: '👋',
      color: 'bg-indigo-500',
    },
  ];

  const handleCardClick = (cardId: string) => {
    dispatch({ type: 'SET_SELECTED_CARD', payload: cardId });

    // Reset prompt content when switching cards
    dispatch({ type: 'SET_PROMPT_CONTENT', payload: '' });
  };

  const handleGenerateContent = async () => {
    if (!state.promptContent.trim()) {
      alert('Please enter an AI prompt first.');
      return;
    }

    if (!state.sourceContent.trim()) {
      alert('Please add source content first.');
      return;
    }

    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_GENERATION_ERROR', payload: '' });

    try {
      // Use the existing Gemini API endpoint
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: state.sourceContent,
          contentType: 'trivia_questions', // Default to trivia, could be made dynamic based on selectedCard
          numItems: 5,
          customPrompt: state.promptContent, // Use the user's custom prompt
        }),
      });

      const result = await response.json();

      if (result.success) {
        dispatch({
          type: 'SET_GENERATED_CONTENT',
          payload: JSON.stringify(result.content, null, 2),
        });
      } else {
        dispatch({
          type: 'SET_GENERATION_ERROR',
          payload: result.error || 'Failed to generate content',
        });
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      dispatch({
        type: 'SET_GENERATION_ERROR',
        payload: 'Failed to generate content. Please try again.',
      });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Processing Section */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Content Processing
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate structured content using AI prompts
            </p>
          </div>

          {/* Divider */}
          <div className="mb-6">
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* "What do you want to produce?" Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              What do you want to produce?
            </h3>

            {/* Content Type Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {contentTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleCardClick(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    state.selectedCard === type.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 bg-white dark:bg-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center text-white text-xl mx-auto mb-3`}
                    >
                      {type.icon}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {type.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Prompt Area */}
          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                AI Prompt
              </h3>

              <textarea
                value={state.promptContent}
                onChange={e =>
                  dispatch({
                    type: 'SET_PROMPT_CONTENT',
                    payload: e.target.value,
                  })
                }
                placeholder="Enter or paste your AI prompt here..."
                className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 min-h-[120px] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical"
              />
            </div>
          </div>

          {/* Source Content Input */}
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Source Content
            </h3>

            <textarea
              value={state.sourceContent}
              onChange={e =>
                dispatch({
                  type: 'SET_SOURCE_CONTENT',
                  payload: e.target.value,
                })
              }
              placeholder="Paste your source content here..."
              className="w-full min-h-[200px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {state.sourceContent ? (
                  <>
                    <span className="font-medium">
                      {state.sourceContent.split(/\s+/).filter(Boolean).length}
                    </span>{' '}
                    words •{' '}
                    <span className="font-medium">
                      {state.sourceContent.length}
                    </span>{' '}
                    characters
                  </>
                ) : (
                  <span>No content added yet</span>
                )}
              </div>
              <button
                onClick={handleGenerateContent}
                disabled={
                  state.isGenerating ||
                  !state.promptContent.trim() ||
                  !state.sourceContent.trim()
                }
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isGenerating ? 'Generating...' : 'Generate Content'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Content Display */}
      {(state.generatedContent || state.generationError) && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Generated Content
            </h3>

            {state.generationError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {state.generationError}
                </p>
              </div>
            ) : state.generatedContent ? (
              <div className="bg-green-50 dark:bg-gray-900 rounded-lg border border-green-200 dark:border-gray-700 p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {state.generatedContent}
                </pre>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
