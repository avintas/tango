import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const contentType = url.searchParams.get('type') || 'trivia';

    // Map content types to their variable files
    const variableFiles: Record<string, string> = {
      trivia: 'trivia-variables.md',
      stats: 'stats-variables.md',
      stories: 'stories-variables.md',
      hugs: 'hugs-variables.md',
      motivational: 'motivational-variables.md',
    };

    const fileName = variableFiles[contentType];
    if (!fileName) {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown content type: ${contentType}`,
        },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'prompt-variables', fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          error: `Variable file not found: ${fileName}`,
        },
        { status: 404 }
      );
    }

    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');

    return NextResponse.json({
      success: true,
      data: {
        content,
        fileName,
        contentType,
      },
    });
  } catch (error) {
    console.error('Error reading prompt variables:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, contentType } = await request.json();

    if (!content || !contentType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content and contentType are required',
        },
        { status: 400 }
      );
    }

    // Map content types to their variable files
    const variableFiles: Record<string, string> = {
      trivia: 'trivia-variables.md',
      stats: 'stats-variables.md',
      stories: 'stories-variables.md',
      hugs: 'hugs-variables.md',
      motivational: 'motivational-variables.md',
    };

    const fileName = variableFiles[contentType];
    if (!fileName) {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown content type: ${contentType}`,
        },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'prompt-variables', fileName);

    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, content, 'utf8');

    return NextResponse.json({
      success: true,
      message: `Variables updated for ${contentType}`,
      fileName,
    });
  } catch (error) {
    console.error('Error updating prompt variables:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
