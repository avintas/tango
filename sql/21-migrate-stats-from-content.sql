-- Migrate statistics from content table to dedicated collection_stats table
-- This script identifies content entries with content_type = 'statistic'
-- and migrates them to the new collection_stats table

-- Preview what will be migrated (run this first to check)
-- SELECT 
--   id,
--   content_text,
--   theme,
--   category,
--   attribution,
--   status,
--   created_at
-- FROM content
-- WHERE content_type = 'statistic'
-- LIMIT 10;

-- Perform the migration
INSERT INTO public.collection_stats (
  stat_text,
  stat_value,
  stat_category,
  year,
  theme,
  category,
  attribution,
  status,
  source_content_id,
  display_order,
  created_at,
  updated_at,
  published_at
)
SELECT 
  content_text AS stat_text,
  NULL AS stat_value,  -- You may need to extract this manually
  NULL AS stat_category,  -- You may need to categorize manually
  NULL AS year,  -- You may need to extract this manually
  theme,
  category,
  attribution,
  COALESCE(status, 'draft') AS status,
  id AS source_content_id,
  NULL AS display_order,
  created_at,
  NOW() AS updated_at,
  CASE 
    WHEN status = 'published' THEN created_at
    ELSE NULL
  END AS published_at
FROM content
WHERE content_type = 'statistic';

-- Verify migration
SELECT 
  COUNT(*) as migrated_count,
  status,
  COUNT(*) FILTER (WHERE source_content_id IS NOT NULL) as from_content_table
FROM collection_stats
GROUP BY status;

