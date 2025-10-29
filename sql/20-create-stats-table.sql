-- Create dedicated stats table for hockey statistics
-- Replaces the mixed use of content table for statistical content
-- Provides clean, purpose-built schema for statistics

CREATE TABLE IF NOT EXISTS public.stats (
  -- Primary Key
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  
  -- Core Content Fields (STATS-SPECIFIC)
  stat_text TEXT NOT NULL,
  stat_value TEXT,
  stat_category TEXT,
  year INTEGER,
  
  -- Metadata & Classification (STANDARD)
  theme TEXT,
  category TEXT,
  attribution TEXT,
  
  -- Status & Workflow (STANDARD)
  status TEXT,
  
  -- Source Tracking (STANDARD)
  source_content_id BIGINT,
  
  -- Usage Tracking (STANDARD)
  used_in TEXT[],
  
  -- Display/Ordering (STANDARD)
  display_order INTEGER,
  
  -- Timestamps (STANDARD)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stats_status 
  ON public.stats(status);

CREATE INDEX IF NOT EXISTS idx_stats_theme 
  ON public.stats(theme);

CREATE INDEX IF NOT EXISTS idx_stats_created_at 
  ON public.stats(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stats_published_at 
  ON public.stats(published_at DESC);

-- Additional stats-specific indexes
CREATE INDEX IF NOT EXISTS idx_stats_category 
  ON public.stats(stat_category);

CREATE INDEX IF NOT EXISTS idx_stats_year 
  ON public.stats(year DESC);

-- Add table and column comments
COMMENT ON TABLE public.stats IS 'Dedicated table for hockey statistics';
COMMENT ON COLUMN public.stats.stat_text IS 'The full statistical statement text';
COMMENT ON COLUMN public.stats.stat_value IS 'The actual numeric value/stat (e.g., "894 goals")';
COMMENT ON COLUMN public.stats.stat_category IS 'Type of statistic: player, team, league, historical';
COMMENT ON COLUMN public.stats.year IS 'Year the stat is from (if applicable)';
COMMENT ON COLUMN public.stats.theme IS 'Thematic classification (e.g., scoring, defense, records)';
COMMENT ON COLUMN public.stats.category IS 'Secondary classification (e.g., NHL, playoffs, season, career)';
COMMENT ON COLUMN public.stats.attribution IS 'Source attribution (e.g., NHL Official Stats, Hockey Reference)';
COMMENT ON COLUMN public.stats.status IS 'Workflow status: draft, published, archived';
COMMENT ON COLUMN public.stats.source_content_id IS 'Foreign key to source material if applicable';
COMMENT ON COLUMN public.stats.used_in IS 'Array tracking where this stat has been deployed';
COMMENT ON COLUMN public.stats.display_order IS 'Manual ordering for display purposes';
COMMENT ON COLUMN public.stats.published_at IS 'Timestamp when first published';
COMMENT ON COLUMN public.stats.archived_at IS 'Timestamp when archived';

