import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the generative model (Gemini Pro)
const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

// Configuration for content type prompts and structures
const CONTENT_TYPE_CONFIG = {
  trivia_questions: {
    example: `[
  {
    "question": "What is the question?",
    "correct_answer": "The correct answer",
    "incorrect_answers": ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
    "difficulty": "easy|medium|hard",
    "category": "Players|Teams|Rules|History|Achievements",
    "explanation": "Optional brief explanation"
  }
]`,
  },
  factoids: {
    example: `[
  {
    "fact": "Interesting hockey fact",
    "category": "Players|Teams|Rules|History|Achievements",
    "source": "Optional source information",
    "difficulty": "easy|medium|hard"
  }
]`,
  },
  quotes: {
    example: `[
  {
    "quote": "The actual quote",
    "speaker": "Who said it",
    "context": "When/where it was said",
    "category": "Players|Teams|Rules|History|Achievements"
  }
]`,
  },
  statistics: {
    example: `[
  {
    "statistic": "What the stat measures",
    "value": "The actual number/value",
    "context": "Additional context about the stat",
    "category": "Players|Teams|Rules|History|Achievements"
  }
]`,
  },
  stories: {
    example: `[
  {
    "title": "Story title",
    "story": "The full story narrative",
    "category": "Players|Teams|Rules|History|Achievements",
    "key_points": ["Key point 1", "Key point 2", "Key point 3"]
  }
]`,
  },
  rules: {
    example: `[
  {
    "rule": "The rule name",
    "explanation": "Detailed explanation of the rule",
    "examples": ["Example 1", "Example 2", "Example 3"],
    "category": "Players|Teams|Rules|History|Achievements"
  }
]`,
  },
  achievements: {
    example: `[
  {
    "achievement": "What was achieved",
    "player_or_team": "Who achieved it",
    "year": "When it happened",
    "context": "Additional context",
    "category": "Players|Teams|Rules|History|Achievements"
  }
]`,
  },
  history: {
    example: `[
  {
    "event": "What happened",
    "date": "When it happened",
    "significance": "Why it matters",
    "details": "Additional details",
    "category": "Players|Teams|Rules|History|Achievements"
  }
]`,
  },
} as const;

export interface TriviaQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  explanation?: string;
}

export interface Factoid {
  fact: string;
  category: string;
  source?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quote {
  quote: string;
  speaker: string;
  context?: string;
  category: string;
}

export interface Statistic {
  statistic: string;
  value: string;
  context: string;
  category: string;
}

export interface Story {
  title: string;
  story: string;
  category: string;
  key_points: string[];
}

export interface RuleExplanation {
  rule: string;
  explanation: string;
  examples: string[];
  category: string;
}

export interface Achievement {
  achievement: string;
  player_or_team: string;
  year?: string;
  context: string;
  category: string;
}

export interface HistoricalContent {
  event: string;
  date: string;
  significance: string;
  details: string;
  category: string;
}

export type ContentType =
  | 'trivia_questions'
  | 'factoids'
  | 'quotes'
  | 'statistics'
  | 'stories'
  | 'rules'
  | 'achievements'
  | 'history';

export interface ContentGenerationResult {
  success: boolean;
  content: any[];
  contentType: ContentType;
  error?: string;
  processingTime: number;
}

/**
 * Centralized helper function for calling Gemini API and parsing responses
 */
async function _callGeminiAndParse(
  prompt: string,
  contentType: ContentType,
  validateStructure?: (content: any[]) => boolean
): Promise<ContentGenerationResult> {
  const startTime = performance.now();

  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let generatedContent: any[];
    try {
      // Clean up the response text (remove any markdown formatting)
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      generatedContent = JSON.parse(cleanedText);
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError}`);
    }

    // Validate the response structure
    if (!Array.isArray(generatedContent)) {
      throw new Error('Gemini response is not an array');
    }

    // Run custom validation if provided
    if (validateStructure && !validateStructure(generatedContent)) {
      throw new Error('Generated content does not match expected structure');
    }

    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);

    return {
      success: true,
      content: generatedContent,
      contentType,
      processingTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);

    return {
      success: false,
      content: [],
      contentType,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTime,
    };
  }
}

/**
 * Generate content based on type from hockey content
 */
export async function generateContent(
  content: string,
  contentType: ContentType,
  numItems: number = 5
): Promise<ContentGenerationResult> {
  // Validate content
  if (!content.trim()) {
    return {
      success: false,
      content: [],
      contentType,
      error: 'Content is required for content generation',
      processingTime: 0,
    };
  }

  // Get the appropriate prompt based on content type
  const prompt = getPromptForContentType(contentType, content, numItems);

  // Add validation for trivia questions (more strict validation)
  const validateStructure =
    contentType === 'trivia_questions'
      ? (generatedContent: any[]) => {
          return generatedContent.every(
            item =>
              item.question &&
              item.correct_answer &&
              Array.isArray(item.incorrect_answers) &&
              item.incorrect_answers.length === 3
          );
        }
      : undefined;

  return _callGeminiAndParse(prompt, contentType, validateStructure);
}

/**
 * Get prompt for specific content type
 */
function getPromptForContentType(
  contentType: ContentType,
  content: string,
  numItems: number
): string {
  const config = CONTENT_TYPE_CONFIG[contentType];
  if (!config) {
    throw new Error(`Unknown content type: ${contentType}`);
  }

  const basePrompt = `You are a hockey content expert creating ${contentType.replace('_', ' ')} for Onlyhockey.com.

Generate ${numItems} items based on this hockey content:

${content}

Requirements:
- Make content engaging and educational
- Focus on interesting facts, player achievements, team history, rules, or memorable moments
- Ensure content is accurate and well-structured
- Use proper hockey terminology and context

Return ONLY a valid JSON array with this exact structure:`;

  return `${basePrompt}
${config.example}

Important: Return ONLY the JSON array, no other text or formatting.`;
}

/**
 * Generate trivia questions from hockey content (legacy function - use generateContent instead)
 * @deprecated Use generateContent(content, 'trivia_questions', numQuestions) instead
 */
export async function generateTriviaQuestions(
  content: string,
  numQuestions: number = 5
): Promise<ContentGenerationResult> {
  console.warn(
    'generateTriviaQuestions is deprecated. Use generateContent(content, "trivia_questions", numQuestions) instead.'
  );
  return generateContent(content, 'trivia_questions', numQuestions);
}

/**
 * Test Gemini API connection
 */
export async function testGeminiConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  const testPrompt = 'Say "Hello, Gemini API is working!" and nothing else.';

  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: 'GEMINI_API_KEY environment variable is not set',
      };
    }

    // Simple test prompt
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();

    if (text.toLowerCase().includes('working')) {
      return { success: true };
    } else {
      return { success: false, error: 'Unexpected response from Gemini API' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get content analysis and suggestions
 */
export async function analyzeContent(content: string): Promise<{
  success: boolean;
  analysis?: string;
  suggestions?: string[];
  error?: string;
}> {
  if (!content.trim()) {
    return {
      success: false,
      error: 'Content is required for analysis',
    };
  }

  const prompt = `
Analyze this hockey content for trivia potential:

${content}

Provide:
1. A brief analysis of the content quality and trivia potential
2. 3-5 specific suggestions for trivia questions that could be generated
3. Suggested difficulty level (easy/medium/hard mix)

Format as JSON:
{
  "analysis": "Brief analysis of content",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "difficulty": "easy|medium|hard"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const analysisResult = JSON.parse(cleanedText);

    return {
      success: true,
      analysis: analysisResult.analysis,
      suggestions: analysisResult.suggestions,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
