import { NextRequest, NextResponse } from 'next/server';
import { testGeminiConnection } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Gemini API is not available - API key not configured',
    message: 'Gemini API is disabled - no API key configured',
  });
}
