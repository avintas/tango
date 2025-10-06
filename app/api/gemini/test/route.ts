import { NextRequest, NextResponse } from 'next/server';
import { testGeminiConnection } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const result = await testGeminiConnection();
    return NextResponse.json(result);
  } catch (error) {
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
