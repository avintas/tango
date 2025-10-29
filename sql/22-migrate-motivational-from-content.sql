-- Migrate motivational quotes from content table to dedicated motivational table
-- Moves all motivational content (content_type = 'motivational') to the new table

-- Preview what will be migrated (uncomment to check first)
-- SELECT 
--   id,
--   content_text,
--   theme,
--   category,
--   attribution,
--   status,
--   created_at
-- FROM content
-- WHERE content_type = 'motivational'
-- ORDER BY id
-- LIMIT 10;

-- Perform the migration
INSERT INTO public.motivational (
  quote,
  context,
  theme,
  category,
  attribution,
  status,
  source_content_id,
  used_in,
  display_order,
  created_at,
  updated_at,
  published_at,
  archived_at
)
SELECT
  -- Map content_text to quote
  content_text AS quote,
  
  -- Context field (not available in old content table)
  NULL AS context,
  
  -- Direct field copies
  theme,
  category,
  attribution,
  status,
  
  -- Track source content ID for reference
  id AS source_content_id,
  
  -- Copy usage tracking
  used_in,
  
  -- Use old content.id for display ordering
  id AS display_order,
  
  -- Timestamps
  created_at,
  updated_at,
  
  -- Set published_at to created_at for published items
  CASE 
    WHEN status = 'published' THEN created_at
    ELSE NULL
  END AS published_at,
  
  -- Set archived_at to updated_at for archived items
  CASE 
    WHEN status = 'archived' THEN updated_at
    ELSE NULL
  END AS archived_at

FROM public.content
WHERE content_type = 'motivational'
ORDER BY id;

-- Show migration results
SELECT 
  COUNT(*) as total_migrated,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
  COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_count,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
  COUNT(CASE WHEN status IS NULL OR status NOT IN ('published', 'archived', 'draft') THEN 1 END) as other_count
FROM public.motivational;

-- Show theme distribution
SELECT 
  theme,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published
FROM public.motivational
GROUP BY theme
ORDER BY count DESC;

