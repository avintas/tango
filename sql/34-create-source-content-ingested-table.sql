-- Migration 34: Create source_content_ingested table
-- Purpose: Store source content processed through the new workflow system with AI-extracted metadata
-- Note: Completely separate from existing 'ingested' table for modularity

CREATE TABLE IF NOT EXISTS public.source_content_ingested (
  -- Primary key
  id BIGSERIAL PRIMARY KEY,
  
  -- Content fields
  content_text TEXT NOT NULL,
  word_count INTEGER,
  char_count INTEGER,
  
  -- AI-extracted metadata fields
  theme TEXT NOT NULL,                    -- Primary theme (required, must be one of 5 standardized themes)
  tags TEXT[],                            -- Rich tag fabric (array)
  category TEXT,                          -- Theme-specific category refinement (standardized list)
  summary TEXT,                           -- AI-generated summary
  title TEXT,                             -- AI-generated title
  key_phrases TEXT[],                     -- Key phrases extracted by AI
  metadata JSONB,                         -- Additional AI-generated metadata (flexible)
  
  -- Workflow tracking
  ingestion_process_id TEXT,               -- Link to process execution (for tracking)
  ingestion_status TEXT NOT NULL DEFAULT 'draft',  -- 'draft', 'validated', 'enriched', 'complete'
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT ingestion_status_check CHECK (ingestion_status IN ('draft', 'validated', 'enriched', 'complete')),
  CONSTRAINT theme_check CHECK (theme IN ('Players', 'Teams & Organizations', 'Venues & Locations', 'Awards & Honors', 'Leadership & Staff')),
  CONSTRAINT category_check CHECK (
    category IS NULL OR category IN (
      -- Players theme categories
      'Player Spotlight', 'Sharpshooters', 'Net Minders', 'Icons', 'Captains', 'Hockey is Family',
      -- Teams & Organizations theme categories
      'Stanley Cup Playoffs', 'NHL Draft', 'Free Agency', 'Game Day', 'Hockey Nations', 'All-Star Game', 'Heritage Classic',
      -- Venues & Locations theme categories
      'Stadium Series', 'Global Series',
      -- Awards & Honors theme categories
      'NHL Awards', 'Milestones',
      -- Leadership & Staff theme categories
      'Coaching', 'Management', 'Front Office'
    )
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_source_content_theme ON public.source_content_ingested (theme);
CREATE INDEX IF NOT EXISTS idx_source_content_category ON public.source_content_ingested (category);
CREATE INDEX IF NOT EXISTS idx_source_content_ingestion_status ON public.source_content_ingested (ingestion_status);
CREATE INDEX IF NOT EXISTS idx_source_content_tags ON public.source_content_ingested USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_source_content_key_phrases ON public.source_content_ingested USING GIN (key_phrases);
CREATE INDEX IF NOT EXISTS idx_source_content_metadata ON public.source_content_ingested USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_source_content_created_at ON public.source_content_ingested (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_source_content_title ON public.source_content_ingested (title);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_source_content_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER on_source_content_update
BEFORE UPDATE ON public.source_content_ingested
FOR EACH ROW
EXECUTE PROCEDURE public.handle_source_content_update();

