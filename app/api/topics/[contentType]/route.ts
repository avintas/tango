import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface TopicConfig {
  name: string;
  description: string;
}

function parseTopicsFromMarkdown(content: string): TopicConfig[] {
  const topics: TopicConfig[] = [];

  // Split content into sections
  const sections = content.split(/^### /m);

  for (const section of sections) {
    if (section.trim()) {
      const lines = section.trim().split('\n');
      const topicName = lines[0].trim();

      if (topicName && lines.length > 1) {
        // Get description (everything after the first line)
        const description = lines.slice(1).join(' ').replace(/\n/g, ' ').trim();

        topics.push({
          name: topicName,
          description: description,
        });
      }
    }
  }

  return topics;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { contentType: string } }
) {
  try {
    const { contentType } = params;

    // Map content types to their config files
    const contentTypeFiles: { [key: string]: string } = {
      trivia_sets: 'trivia-topics.md',
      statistics: 'statistics-topics.md',
      lore: 'lore-topics.md',
      motivational: 'motivational-topics.md',
      greetings: 'greetings-topics.md',
    };

    const filename = contentTypeFiles[contentType];
    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Read the markdown file
    const configDir = path.join(process.cwd(), 'config', 'content-topics');
    const filePath = path.join(configDir, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Topics config file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const topics = parseTopicsFromMarkdown(fileContent);

    return NextResponse.json({
      success: true,
      topics,
      contentType,
    });
  } catch (error) {
    console.error('Error loading topics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
