-- Rename greetings table to collection_greetings
-- This aligns with the collection naming convention for content tables

-- Step 1: Rename the table
ALTER TABLE IF EXISTS public.greetings 
RENAME TO collection_greetings;

-- Step 2: Rename all indexes
ALTER INDEX IF EXISTS idx_greetings_status 
RENAME TO idx_collection_greetings_status;

ALTER INDEX IF EXISTS idx_greetings_created_at 
RENAME TO idx_collection_greetings_created_at;

ALTER INDEX IF EXISTS idx_greetings_published_at 
RENAME TO idx_collection_greetings_published_at;

-- Step 3: Update table comment
COMMENT ON TABLE public.collection_greetings IS 'Dedicated table for Hockey Universal Greetings (HUG) - supportive messages for moral support and encouragement';

-- Step 4: Update column comments (if needed, they reference table name)
COMMENT ON COLUMN public.collection_greetings.greeting_text IS 'The greeting message text';
COMMENT ON COLUMN public.collection_greetings.attribution IS 'Source attribution if applicable';
COMMENT ON COLUMN public.collection_greetings.status IS 'Workflow status: draft, published, archived';
COMMENT ON COLUMN public.collection_greetings.source_content_id IS 'Foreign key to source material if applicable';
COMMENT ON COLUMN public.collection_greetings.used_in IS 'Array tracking where this greeting has been deployed';
COMMENT ON COLUMN public.collection_greetings.display_order IS 'Manual ordering for display purposes';
COMMENT ON COLUMN public.collection_greetings.published_at IS 'Timestamp when first published';
COMMENT ON COLUMN public.collection_greetings.archived_at IS 'Timestamp when archived';

-- Verification query
SELECT 
  COUNT(*) as total_greetings,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count
FROM public.collection_greetings;

