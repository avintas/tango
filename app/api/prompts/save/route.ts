import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { promptName, promptContent, category } = await request.json();

    // Validate inputs
    if (!promptName || !promptContent || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: promptName, promptContent, category',
        },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      'trivia',
      'stats',
      'hugs',
      'motivational',
      'stories',
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Sanitize filename (remove special characters, spaces to hyphens)
    const sanitizedName = promptName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    if (!sanitizedName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid prompt name',
        },
        { status: 400 }
      );
    }

    // Create file path
    const promptsDir = path.join(process.cwd(), 'prompts', category);
    const fileName = `${sanitizedName}.md`;
    const filePath = path.join(promptsDir, fileName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          error: `A prompt with name "${promptName}" already exists in ${category}`,
        },
        { status: 409 }
      );
    }

    // Ensure directory exists
    if (!fs.existsSync(promptsDir)) {
      fs.mkdirSync(promptsDir, { recursive: true });
    }

    // Create markdown content with metadata
    const timestamp = new Date().toISOString();
    const markdownContent = `---
name: ${promptName}
category: ${category}
created: ${timestamp}
---

${promptContent}
`;

    // Write file
    fs.writeFileSync(filePath, markdownContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: `Prompt saved successfully as ${fileName}`,
      filePath: `prompts/${category}/${fileName}`,
    });
  } catch (error) {
    console.error('Error saving prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
