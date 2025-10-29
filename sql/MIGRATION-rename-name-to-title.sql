-- Migration: Rename 'name' column to 'title' in hero_collections table
-- Date: October 29, 2025
-- Description: Renames the 'name' field to 'title' for better semantic clarity

-- Step 1: Rename the column
ALTER TABLE public.hero_collections 
RENAME COLUMN name TO title;

-- Step 2: Verify the change
SELECT 
  id,
  title, 
  description,
  jsonb_array_length(content_items) as content_count,
  active,
  display_order,
  created_at
FROM public.hero_collections
ORDER BY display_order;

-- Note: The UNIQUE constraint and indexes automatically transfer to the new column name

