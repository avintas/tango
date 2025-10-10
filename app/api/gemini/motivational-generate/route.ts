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

    // Enhanced prompt specifically for motivational content generation
    const enhancedPrompt = `${prompt}

CRITICAL MOTIVATIONAL REQUIREMENTS:
- ALL hockey information must be 100% accurate and factually correct
- Focus on inspiring, energizing, and goal-oriented content
- Emphasize determination, perseverance, teamwork, and achievement
- Use powerful, action-oriented language that motivates readers
- Include specific examples of overcoming challenges and achieving success
- Create content that encourages readers to take action and pursue their goals

MOTIVATIONAL FORMATTING REQUIREMENTS:
- For Markdown: Use strong headers, action-oriented language, and inspiring formatting
- For JSON: Structure with title, message, action_steps, inspiration, key_points fields
- For Lists: Use motivational bullet points with actionable insights
- Include powerful quotes and calls-to-action

CONTENT QUALITY:
- Focus on: overcoming adversity, achieving goals, teamwork, dedication, resilience
- Highlight: players who overcame obstacles, teams that achieved the impossible, underdog victories
- Include: specific examples of hard work paying off, never giving up, pushing through challenges
- Create: content that energizes and motivates readers to pursue their own goals
- Use: strong, positive language that builds confidence and determination
- Make content: actionable, inspiring, and suitable for motivational social media and website content`;

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
    console.error('Gemini motivational generation error:', error);

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
