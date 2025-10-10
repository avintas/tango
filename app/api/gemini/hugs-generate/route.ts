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

    // Enhanced prompt specifically for HUGs generation
    const enhancedPrompt = `${prompt}

CRITICAL HUGs REQUIREMENTS:
- ALL hockey information must be 100% accurate and factually correct
- Focus on heartwarming, uplifting, and inspirational hockey moments
- Highlight acts of kindness, sportsmanship, community, and human connection
- Emphasize the positive impact hockey has on people's lives
- Include emotional depth and genuine human stories
- Use warm, compassionate, and uplifting language

HUGs FORMATTING REQUIREMENTS:
- For Markdown: Use heartwarming headers, emotional storytelling, and inspirational formatting
- For JSON: Structure with title, story, impact, emotions, key_moments fields
- For Lists: Use uplifting bullet points with emotional highlights
- Include quotes and dialogue that showcase human connection

CONTENT QUALITY:
- Focus on: community outreach, player charity work, fan connections, team unity, overcoming adversity
- Highlight: acts of sportsmanship, mentorship, family connections, community support
- Include: specific examples of players helping others, teams giving back, fans supporting each other
- Create: emotional connections that make readers feel good about hockey and humanity
- Use: inspiring language that celebrates the best of hockey culture
- Make content: uplifting, shareable, and suitable for positive social media and website content`;

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
    console.error('Gemini HUGs generation error:', error);

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
