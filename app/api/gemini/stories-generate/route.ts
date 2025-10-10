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

    // Enhanced prompt specifically for stories generation
    const enhancedPrompt = `${prompt}

CRITICAL STORIES REQUIREMENTS:
- ALL hockey information must be 100% accurate and factually correct
- Use proper hockey terminology and context
- Create engaging narrative structure with clear beginning, middle, and end
- Include vivid details, emotions, and atmosphere
- Focus on compelling characters, dramatic moments, and memorable events
- Use storytelling techniques: dialogue, description, pacing, tension

STORIES FORMATTING REQUIREMENTS:
- For Markdown: Use proper headers, paragraphs, and emphasis for narrative flow
- For JSON: Structure with title, story, characters, key_points, setting fields
- For Lists: Use story outlines or key moment summaries
- Ensure proper pacing and readability

CONTENT QUALITY:
- Focus on memorable hockey moments, legendary players, historic games, team rivalries
- Create emotional connections with readers
- Include specific details: dates, scores, player names, locations
- Build narrative tension and resolution
- Make stories engaging for hockey fans of all levels
- Use descriptive language to bring scenes to life
- Include quotes and dialogue when appropriate
- Make content suitable for feature articles and website publication`;

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
    console.error('Gemini stories generation error:', error);

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
