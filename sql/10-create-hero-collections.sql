-- Create hero_collections table for random rotating content sets
-- Each collection contains 7 complete content items stored as JSONB
-- Random selection on each page load (with recent history exclusion)

CREATE TABLE IF NOT EXISTS public.hero_collections (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE, -- 'Morning Motivation', 'Stats & Facts', etc.
  description TEXT, -- Optional description for CMS management
  content_items JSONB NOT NULL, -- Array of complete content objects
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0, -- Optional: for CMS display ordering
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast active lookup
CREATE INDEX IF NOT EXISTS idx_hero_collections_active 
  ON public.hero_collections(active);

-- Add comments
COMMENT ON TABLE public.hero_collections IS 'Stores curated collections of 7 content items for random rotation on the hero section';
COMMENT ON COLUMN public.hero_collections.content_items IS 'JSONB array of complete content objects with text, type, theme, etc.';
COMMENT ON COLUMN public.hero_collections.active IS 'Only active collections are eligible for random selection';
COMMENT ON COLUMN public.hero_collections.display_order IS 'Used for ordering in CMS interface only';

