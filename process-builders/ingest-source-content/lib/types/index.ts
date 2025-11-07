// Types specific to ingest-source-content process builder

export interface ProcessedContent {
  content_text: string;
  word_count: number;
  char_count: number;
  normalized_text: string;
}

export interface ExtractedMetadata {
  theme: string;
  tags: string[];
  category?: string;
}

export interface ContentEnrichment {
  summary: string;
  title: string;
  key_phrases: string[];
}
