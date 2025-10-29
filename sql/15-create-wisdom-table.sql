-- Create dedicated wisdom table for Penalty Box Philosopher content
-- Replaces the mixed use of content table fields (musings, from_the_box)
-- Provides clean, purpose-built schema for philosophical musings

CREATE TABLE IF NOT EXISTS public.wisdom (
  -- Primary Key
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  
  -- Core Content Fields
  title TEXT NOT NULL,
  musing TEXT NOT NULL,
  from_the_box TEXT NOT NULL,
  
  -- Metadata & Classification
  theme TEXT,
  category TEXT,
  attribution TEXT,
  
  -- Status & Workflow
  status TEXT,
  
  -- Source Tracking
  source_content_id BIGINT,
  
  -- Usage Tracking
  used_in TEXT[],
  
  -- Display/Ordering
  display_order INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wisdom_status 
  ON public.wisdom(status);

CREATE INDEX IF NOT EXISTS idx_wisdom_theme 
  ON public.wisdom(theme);

CREATE INDEX IF NOT EXISTS idx_wisdom_created_at 
  ON public.wisdom(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wisdom_published_at 
  ON public.wisdom(published_at DESC);

-- Add table and column comments
COMMENT ON TABLE public.wisdom IS 'Dedicated table for Penalty Box Philosopher philosophical musings and wisdom';
COMMENT ON COLUMN public.wisdom.title IS 'Title/heading of the wisdom entry';
COMMENT ON COLUMN public.wisdom.musing IS 'Full philosophical musing text';
COMMENT ON COLUMN public.wisdom.from_the_box IS 'Key quote or summary extracted from the musing';
COMMENT ON COLUMN public.wisdom.theme IS 'Thematic classification (e.g., impact, perspective, resilience)';
COMMENT ON COLUMN public.wisdom.category IS 'Secondary classification if needed';
COMMENT ON COLUMN public.wisdom.attribution IS 'Source attribution (e.g., Penalty Box Philosopher)';
COMMENT ON COLUMN public.wisdom.status IS 'Workflow status: draft, published, archived';
COMMENT ON COLUMN public.wisdom.source_content_id IS 'Foreign key to source material if applicable';
COMMENT ON COLUMN public.wisdom.used_in IS 'Array tracking where this wisdom has been deployed';
COMMENT ON COLUMN public.wisdom.display_order IS 'Manual ordering for display purposes';
COMMENT ON COLUMN public.wisdom.published_at IS 'Timestamp when first published';
COMMENT ON COLUMN public.wisdom.archived_at IS 'Timestamp when archived';

