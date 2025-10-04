import { NextRequest, NextResponse } from 'next/server';
import { testGeminiConnection } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const result = await testGeminiConnection();

    return NextResponse.json({
      success: result.success,
      error: result.error,
      message: result.success
        ? 'Gemini API connection successful!'
        : `Connection failed: ${result.error}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
