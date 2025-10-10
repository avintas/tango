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

    // Enhanced prompt to ensure high-quality output
    const enhancedPrompt = `${prompt}

CRITICAL QUALITY REQUIREMENTS:
- Ensure ALL hockey information is 100% accurate and factually correct
- Use current, up-to-date statistics and information
- Make content engaging and educational for hockey fans
- Use proper hockey terminology and context

FORMATTING REQUIREMENTS:
- For Markdown: Use proper headers (# ## ###), bullet points, **bold**, *italics*
- For JSON: Use clean, valid JSON structure with proper field names
- For Lists: Use numbered (1. 2. 3.) or bulleted (• • •) format
- Ensure proper spacing and organization
- Make content professional and publication-ready

TRIVIA-SPECIFIC REQUIREMENTS:
- Multiple Choice: Provide exactly 4 options (1 correct + 3 plausible wrong answers)
- True/False: Use clear, definitive statements
- Wrong answers must be realistic and believable
- Include difficulty assessment when appropriate
- Make questions challenging but fair

CONTENT STRUCTURE:
- Organize information logically
- Use clear, concise language
- Include relevant context and explanations
- Ensure content flows naturally
- Make it suitable for website publication`;

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
    console.error('Gemini prompt generation error:', error);

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
