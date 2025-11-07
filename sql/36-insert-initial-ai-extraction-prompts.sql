-- Migration 36: Insert initial AI extraction prompts
-- Purpose: Add default prompts for metadata extraction and content enrichment
-- Note: These are starter prompts - users can edit them via the UI

-- Prompt 1: Metadata Extraction
-- Extracts theme, tags, and category from content
INSERT INTO public.ai_extraction_prompts (
  prompt_name,
  prompt_type,
  prompt_content,
  description,
  is_active
) VALUES (
  'Hockey Content Metadata Extraction',
  'metadata_extraction',
  'You are an expert at analyzing hockey-related content and extracting structured metadata.

Your task is to analyze the provided source content and extract the following metadata:

1. **Theme** (REQUIRED): Classify the content into exactly ONE of these 5 standardized themes:
   - "Players" - Content about individual players, player statistics, personal achievements, individual qualities
   - "Teams & Organizations" - Content about teams, franchises, team history, organizational content, collective concepts
   - "Venues & Locations" - Content about venues, arenas, stadiums, geographic locations, schedules, game locations
   - "Awards & Honors" - Content about awards, trophies, recognition, achievements, legacy, historical achievements
   - "Leadership & Staff" - Content about coaches, management, leadership, mentorship, staff-related content

2. **Tags** (REQUIRED): Extract 5-15 relevant tags as an array. Include:
   - Entity names (team names, player names, locations)
   - Topics (hockey, NHL, sports)
   - Temporal references (2024, playoffs, season)
   - Concepts (strategy, statistics, history)
   - Holidays/time-based markers (Halloween, Christmas, New Year, Hanukkah) if applicable
   - Always include the theme as one of the tags

3. **Category** (OPTIONAL): If applicable, select ONE category that refines the theme. Categories are theme-specific:
   
   For "Players" theme:
   - Player Spotlight
   - Sharpshooters
   - Net Minders
   - Icons
   - Captains
   - Hockey is Family
   
   For "Teams & Organizations" theme:
   - Stanley Cup Playoffs
   - NHL Draft
   - Free Agency
   - Game Day
   - Hockey Nations
   - All-Star Game
   - Heritage Classic
   
   For "Venues & Locations" theme:
   - Stadium Series
   - Global Series
   
   For "Awards & Honors" theme:
   - NHL Awards
   - Milestones
   
   For "Leadership & Staff" theme:
   - Coaching
   - Management
   - Front Office
   
   If no category fits, leave category as null.

**Output Format:**
Return a valid JSON object with this exact structure:
{
  "theme": "one of the 5 standardized themes",
  "tags": ["tag1", "tag2", "tag3", ...],
  "category": "category name or null"
}

**Important Rules:**
- Theme MUST be exactly one of the 5 standardized themes listed above
- Tags must be an array of strings (5-15 tags recommended)
- Category must be one of the listed categories for the selected theme, or null
- All field names must match exactly: theme, tags, category
- Return ONLY valid JSON, no additional text or markdown',
  'Extracts theme, tags, and category from hockey content. Theme is required and must be one of 5 standardized values.',
  true
);

-- Prompt 2: Content Enrichment
-- Generates summary, title, and key phrases
INSERT INTO public.ai_extraction_prompts (
  prompt_name,
  prompt_type,
  prompt_content,
  description,
  is_active
) VALUES (
  'Hockey Content Enrichment',
  'content_enrichment',
  'You are an expert at analyzing hockey-related content and generating enriched metadata.

Your task is to analyze the provided source content and generate:

1. **Summary** (REQUIRED): Generate a comprehensive summary that:
   - Is 3-5 sentences long (100-150 words ideal)
   - Covers the main points and key information
   - Is informative enough to understand the content without reading it in full
   - Uses clear, concise language
   - Focuses on factual information about hockey

2. **Title** (REQUIRED): Generate a concise, descriptive title that:
   - Is 5-15 words long (ideally 8-12 words)
   - Clearly identifies the content subject
   - Uses Title Case format
   - Is specific and informative
   - Avoids vague terms like "Hockey" or "Content"

3. **Key Phrases** (REQUIRED): Extract 5-10 important phrases that:
   - Are multi-word phrases (2-5 words typically)
   - Represent significant concepts, facts, or topics from the content
   - Include named entities (team names, player names)
   - Include important concepts (e.g., "playoff statistics", "team history")
   - Are specific and meaningful (not single words)

**Output Format:**
When generating summary only, return plain text (3-5 sentences).

When generating title and key phrases, return a valid JSON object:
{
  "title": "Generated Title Here",
  "key_phrases": ["phrase 1", "phrase 2", "phrase 3", ...]
}

**Important Rules:**
- Summary should be informative and comprehensive
- Title should be descriptive and specific
- Key phrases should be meaningful multi-word phrases
- All content should be factually accurate
- Use proper hockey terminology',
  'Generates summary, title, and key phrases for hockey content enrichment.',
  true
);

