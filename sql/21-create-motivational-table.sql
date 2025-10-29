-- Create dedicated motivational table for inspirational quotes and messages
-- Provides clean, purpose-built schema for motivational content
-- Follows established pattern from wisdom and greetings tables

CREATE TABLE IF NOT EXISTS public.motivational (
  -- Primary Key
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  
  -- Core Content Fields (MOTIVATIONAL-SPECIFIC)
  quote TEXT NOT NULL,
  context TEXT,
  
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
CREATE INDEX IF NOT EXISTS idx_motivational_status 
  ON public.motivational(status);

CREATE INDEX IF NOT EXISTS idx_motivational_theme 
  ON public.motivational(theme);

CREATE INDEX IF NOT EXISTS idx_motivational_created_at 
  ON public.motivational(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_motivational_published_at 
  ON public.motivational(published_at DESC);

-- Add table and column comments
COMMENT ON TABLE public.motivational IS 'Dedicated table for motivational quotes and inspirational messages';
COMMENT ON COLUMN public.motivational.quote IS 'The motivational quote or message text';
COMMENT ON COLUMN public.motivational.context IS 'Optional background, context, or explanation for the quote';
COMMENT ON COLUMN public.motivational.theme IS 'Thematic classification (e.g., dedication, perseverance, teamwork)';
COMMENT ON COLUMN public.motivational.category IS 'Secondary classification if needed';
COMMENT ON COLUMN public.motivational.attribution IS 'Source attribution (player, coach, team, etc.)';
COMMENT ON COLUMN public.motivational.status IS 'Workflow status: draft, published, archived';
COMMENT ON COLUMN public.motivational.source_content_id IS 'Foreign key to source material if applicable';
COMMENT ON COLUMN public.motivational.used_in IS 'Array tracking where this motivational quote has been deployed';
COMMENT ON COLUMN public.motivational.display_order IS 'Manual ordering for display purposes';
COMMENT ON COLUMN public.motivational.published_at IS 'Timestamp when first published';
COMMENT ON COLUMN public.motivational.archived_at IS 'Timestamp when archived';

