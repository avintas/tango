import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt is required',
        },
        { status: 400 }
      );
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API is not available - API key not configured',
        },
        { status: 500 }
      );
    }

    const startTime = performance.now();

    // Enhanced prompt specifically for trivia generation
    const enhancedPrompt = `${prompt}

CRITICAL TRIVIA REQUIREMENTS:
- ALL hockey information must be 100% accurate and factually correct
- Use current, up-to-date statistics and information
- Multiple Choice: Provide exactly 4 options (1 correct + 3 plausible wrong answers)
- True/False: Use clear, definitive statements that can be proven true or false
- Wrong answers must be realistic and believable - not obviously incorrect
- Include difficulty assessment (easy/medium/hard) for each question
- Make questions challenging but fair for the specified audience

TRIVIA FORMATTING REQUIREMENTS:
- For JSON: Use clean structure with question, correct_answer, incorrect_answers, difficulty fields
- For Markdown: Use numbered questions with clear A/B/C/D options
- For Lists: Use clear question-answer format
- Ensure proper spacing and organization

CONTENT QUALITY:
- Focus on interesting hockey facts, player achievements, team history, rules, memorable moments
- Make content engaging and educational for hockey fans
- Use proper hockey terminology and context
- Ensure questions are appropriate for the specified audience
- Make content suitable for trivia games and website publication`;

    // Generate content using Gemini API
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const generatedText = response.text();

    const processingTime = performance.now() - startTime;

    return NextResponse.json({
      success: true,
      content: generatedText,
      processingTime: Math.round(processingTime),
    });
  } catch (error) {
    console.error('Gemini trivia generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
