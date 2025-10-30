-- Create dedicated collection_greetings table for Hockey Universal Greetings (HUG)
-- Replaces the mixed use of content table for greeting content
-- Provides clean, purpose-built schema for supportive messages

CREATE TABLE IF NOT EXISTS public.collection_greetings (
  -- Primary Key
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  
  -- Core Content Fields (GREETING-SPECIFIC)
  greeting_text TEXT NOT NULL,
  
  -- Metadata (STANDARD)
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
CREATE INDEX IF NOT EXISTS idx_collection_greetings_status 
  ON public.collection_greetings(status);

CREATE INDEX IF NOT EXISTS idx_collection_greetings_created_at 
  ON public.collection_greetings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collection_greetings_published_at 
  ON public.collection_greetings(published_at DESC);

-- Add table and column comments
COMMENT ON TABLE public.collection_greetings IS 'Dedicated table for Hockey Universal Greetings (HUG) - supportive messages for moral support and encouragement';
COMMENT ON COLUMN public.collection_greetings.greeting_text IS 'The greeting message text';
COMMENT ON COLUMN public.collection_greetings.attribution IS 'Source attribution if applicable';
COMMENT ON COLUMN public.collection_greetings.status IS 'Workflow status: draft, published, archived';
COMMENT ON COLUMN public.collection_greetings.source_content_id IS 'Foreign key to source material if applicable';
COMMENT ON COLUMN public.collection_greetings.used_in IS 'Array tracking where this greeting has been deployed';
COMMENT ON COLUMN public.collection_greetings.display_order IS 'Manual ordering for display purposes';
COMMENT ON COLUMN public.collection_greetings.published_at IS 'Timestamp when first published';
COMMENT ON COLUMN public.collection_greetings.archived_at IS 'Timestamp when archived';

