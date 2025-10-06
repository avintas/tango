import { NextRequest, NextResponse } from 'next/server';
import { generateContent, ContentType } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { content, contentType, numItems = 5 } = await request.json();

    if (!content || !contentType) {
      return NextResponse.json(
        {
          success: false,
          content: [],
          error: 'Content and contentType are required',
          processingTime: 0,
        },
        { status: 400 }
      );
    }

    const result = await generateContent(
      content,
      contentType as ContentType,
      numItems
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        content: [],
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: 0,
      },
      { status: 500 }
    );
  }
}
