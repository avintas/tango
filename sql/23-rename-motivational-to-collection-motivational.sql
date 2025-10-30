-- Rename motivational table to collection_motivational
-- This aligns with the collection naming convention for content tables

-- Step 1: Rename the table
ALTER TABLE IF EXISTS public.motivational 
RENAME TO collection_motivational;

-- Step 2: Rename all indexes
ALTER INDEX IF EXISTS idx_motivational_status 
RENAME TO idx_collection_motivational_status;

ALTER INDEX IF EXISTS idx_motivational_theme 
RENAME TO idx_collection_motivational_theme;

ALTER INDEX IF EXISTS idx_motivational_created_at 
RENAME TO idx_collection_motivational_created_at;

ALTER INDEX IF EXISTS idx_motivational_published_at 
RENAME TO idx_collection_motivational_published_at;

-- Step 3: Update table comment
COMMENT ON TABLE public.collection_motivational IS 'Dedicated table for motivational quotes and inspirational messages';

-- Step 4: Update column comments
COMMENT ON COLUMN public.collection_motivational.quote IS 'The motivational quote or message text';
COMMENT ON COLUMN public.collection_motivational.context IS 'Optional background, context, or explanation for the quote';
COMMENT ON COLUMN public.collection_motivational.theme IS 'Thematic classification (e.g., dedication, perseverance, teamwork)';
COMMENT ON COLUMN public.collection_motivational.category IS 'Secondary classification if needed';
COMMENT ON COLUMN public.collection_motivational.attribution IS 'Source attribution (player, coach, team, etc.)';
COMMENT ON COLUMN public.collection_motivational.status IS 'Workflow status: draft, published, archived';
COMMENT ON COLUMN public.collection_motivational.source_content_id IS 'Foreign key to source material if applicable';
COMMENT ON COLUMN public.collection_motivational.used_in IS 'Array tracking where this motivational quote has been deployed';
COMMENT ON COLUMN public.collection_motivational.display_order IS 'Manual ordering for display purposes';
COMMENT ON COLUMN public.collection_motivational.published_at IS 'Timestamp when first published';
COMMENT ON COLUMN public.collection_motivational.archived_at IS 'Timestamp when archived';

-- Verification query
SELECT 
  COUNT(*) as total_motivational,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count
FROM public.collection_motivational;

