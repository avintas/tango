import fs from 'fs';
import path from 'path';

interface TopicConfig {
  name: string;
  description: string;
}

interface ContentTopics {
  [contentType: string]: TopicConfig[];
}

// Cache for loaded topics
let topicsCache: ContentTopics | null = null;

export function loadTopicsConfig(): ContentTopics {
  if (topicsCache) {
    return topicsCache;
  }

  const configDir = path.join(process.cwd(), 'config', 'content-topics');
  const topics: ContentTopics = {};

  // Map content types to their config files
  const contentTypeFiles = {
    trivia_sets: 'trivia-topics.md',
    statistics: 'statistics-topics.md',
    lore: 'lore-topics.md',
    motivational: 'motivational-topics.md',
    greetings: 'greetings-topics.md',
  };

  for (const [contentType, filename] of Object.entries(contentTypeFiles)) {
    try {
      const filePath = path.join(configDir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      topics[contentType] = parseTopicsFromMarkdown(fileContent);
    } catch (error) {
      console.error(`Error loading topics for ${contentType}:`, error);
      topics[contentType] = [];
    }
  }

  topicsCache = topics;
  return topics;
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

export function getTopicsForContentType(contentType: string): TopicConfig[] {
  const topics = loadTopicsConfig();
  return topics[contentType] || [];
}

export function getAllTopicNames(contentType: string): string[] {
  return getTopicsForContentType(contentType).map(topic => topic.name);
}
