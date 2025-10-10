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

    // Enhanced prompt specifically for statistics generation
    const enhancedPrompt = `${prompt}

CRITICAL STATISTICS REQUIREMENTS:
- ALL hockey statistics must be 100% accurate and factually correct
- Use current, up-to-date data and numbers
- Include proper context and time periods for all statistics
- Provide comparative data when relevant (career highs, season comparisons, etc.)
- Include proper units and measurements (goals, assists, points, percentages, etc.)
- Cite specific seasons, years, or time ranges for all data

STATISTICS FORMATTING REQUIREMENTS:
- For JSON: Use clean structure with stat_name, value, context, timeframe, comparison fields
- For Markdown: Use tables or structured lists with clear data presentation
- For Lists: Use bullet points with clear stat-value-context format
- Include data visualization suggestions when appropriate

CONTENT QUALITY:
- Focus on interesting hockey statistics, player achievements, team records, historical data
- Make data engaging and meaningful for hockey fans
- Use proper hockey terminology and statistical context
- Provide insights and analysis beyond just raw numbers
- Include surprising or noteworthy statistical achievements
- Make content suitable for data-driven articles and website publication`;

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
    console.error('Gemini stats generation error:', error);

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
