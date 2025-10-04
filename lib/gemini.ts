import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the generative model (Gemini Pro)
const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

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
 * Generate content based on type from hockey content
 */
export async function generateContent(
  content: string,
  contentType: ContentType,
  numItems: number = 5
): Promise<ContentGenerationResult> {
  const startTime = performance.now();

  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Validate content
    if (!content.trim()) {
      throw new Error('Content is required for content generation');
    }

    // Get the appropriate prompt based on content type
    const prompt = getPromptForContentType(contentType, content, numItems);

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
 * Get prompt for specific content type
 */
function getPromptForContentType(
  contentType: ContentType,
  content: string,
  numItems: number
): string {
  const basePrompt = `You are a hockey content expert creating ${contentType.replace('_', ' ')} for Onlyhockey.com.

Generate ${numItems} items based on this hockey content:

${content}

Requirements:
- Make content engaging and educational
- Focus on interesting facts, player achievements, team history, rules, or memorable moments
- Ensure content is accurate and well-structured
- Use proper hockey terminology and context

Return ONLY a valid JSON array with this exact structure:`;

  switch (contentType) {
    case 'trivia_questions':
      return `${basePrompt}
[
  {
    "question": "What is the question?",
    "correct_answer": "The correct answer",
    "incorrect_answers": ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
    "difficulty": "easy|medium|hard",
    "category": "Players|Teams|Rules|History|Achievements",
    "explanation": "Optional brief explanation"
  }
]`;

    case 'factoids':
      return `${basePrompt}
[
  {
    "fact": "Interesting hockey fact",
    "category": "Players|Teams|Rules|History|Achievements",
    "source": "Optional source information",
    "difficulty": "easy|medium|hard"
  }
]`;

    case 'quotes':
      return `${basePrompt}
[
  {
    "quote": "The actual quote",
    "speaker": "Who said it",
    "context": "When/where it was said",
    "category": "Players|Teams|Rules|History|Achievements"
  }
]`;

    case 'statistics':
      return `${basePrompt}
[
  {
    "statistic": "What the stat measures",
    "value": "The actual number/value",
    "context": "Additional context about the stat",
    "category": "Players|Teams|Rules|History|Achievements"
  }
]`;

    case 'stories':
      return `${basePrompt}
[
  {
    "title": "Story title",
    "story": "The full story narrative",
    "category": "Players|Teams|Rules|History|Achievements",
    "key_points": ["Key point 1", "Key point 2", "Key point 3"]
  }
]`;

    case 'rules':
      return `${basePrompt}
[
  {
    "rule": "The rule name",
    "explanation": "Detailed explanation of the rule",
    "examples": ["Example 1", "Example 2", "Example 3"],
    "category": "Players|Teams|Rules|History|Achievements"
  }
]`;

    case 'achievements':
      return `${basePrompt}
[
  {
    "achievement": "What was achieved",
    "player_or_team": "Who achieved it",
    "year": "When it happened",
    "context": "Additional context",
    "category": "Players|Teams|Rules|History|Achievements"
  }
]`;

    case 'history':
      return `${basePrompt}
[
  {
    "event": "What happened",
    "date": "When it happened",
    "significance": "Why it matters",
    "details": "Additional details",
    "category": "Players|Teams|Rules|History|Achievements"
  }
]`;

    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}

/**
 * Generate trivia questions from hockey content (legacy function)
 */
export async function generateTriviaQuestions(
  content: string,
  numQuestions: number = 5
): Promise<TriviaGenerationResult> {
  const startTime = performance.now();

  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Validate content
    if (!content.trim()) {
      throw new Error('Content is required for trivia generation');
    }

    // Create the prompt for trivia generation
    const prompt = `
You are a hockey trivia expert creating questions for Onlyhockey.com. 

Generate ${numQuestions} trivia questions based on this hockey content:

${content}

Requirements:
1. Create questions that test knowledge, not just memory
2. Make questions engaging and educational
3. Include a mix of easy, medium, and hard difficulty
4. Focus on interesting facts, player achievements, team history, rules, or memorable moments
5. Ensure incorrect answers are plausible but clearly wrong
6. Provide brief explanations when helpful

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "What is the question?",
    "correct_answer": "The correct answer",
    "incorrect_answers": ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
    "difficulty": "easy|medium|hard",
    "category": "Players|Teams|Rules|History|Achievements",
    "explanation": "Optional brief explanation"
  }
]

Important: Return ONLY the JSON array, no other text or formatting.`;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let questions: TriviaQuestion[];
    try {
      // Clean up the response text (remove any markdown formatting)
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      questions = JSON.parse(cleanedText);
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError}`);
    }

    // Validate the response structure
    if (!Array.isArray(questions)) {
      throw new Error('Gemini response is not an array');
    }

    // Validate each question
    for (const question of questions) {
      if (
        !question.question ||
        !question.correct_answer ||
        !Array.isArray(question.incorrect_answers) ||
        question.incorrect_answers.length !== 3
      ) {
        throw new Error('Invalid question structure in Gemini response');
      }
    }

    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);

    return {
      success: true,
      questions,
      processingTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);

    return {
      success: false,
      questions: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTime,
    };
  }
}

/**
 * Test Gemini API connection
 */
export async function testGeminiConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: 'GEMINI_API_KEY environment variable is not set',
      };
    }

    // Simple test prompt
    const result = await model.generateContent(
      'Say "Hello, Gemini API is working!" and nothing else.'
    );
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
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
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
