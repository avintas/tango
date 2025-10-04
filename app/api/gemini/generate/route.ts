import { NextRequest, NextResponse } from 'next/server';
import { generateContent, ContentType } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, contentType, numItems } = body;

    if (!content || !contentType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content and contentType are required',
          message: 'Missing required parameters',
        },
        { status: 400 }
      );
    }

    const result = await generateContent(
      content,
      contentType as ContentType,
      numItems || 5
    );

    return NextResponse.json({
      success: result.success,
      content: result.content,
      contentType: result.contentType,
      error: result.error,
      processingTime: result.processingTime,
      message: result.success
        ? `Generated ${result.content.length} ${contentType.replace('_', ' ')} in ${result.processingTime}ms`
        : `Generation failed: ${result.error}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        content: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
