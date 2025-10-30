-- Rename stats table to collection_stats to match naming convention
-- This migration renames the table and all associated indexes
-- Run this ONLY if you already created the stats table and need to rename it

-- Step 1: Rename the table
ALTER TABLE IF EXISTS public.stats RENAME TO collection_stats;

-- Step 2: Rename all indexes to match new table name
ALTER INDEX IF EXISTS idx_stats_status RENAME TO idx_collection_stats_status;
ALTER INDEX IF EXISTS idx_stats_theme RENAME TO idx_collection_stats_theme;
ALTER INDEX IF EXISTS idx_stats_created_at RENAME TO idx_collection_stats_created_at;
ALTER INDEX IF EXISTS idx_stats_published_at RENAME TO idx_collection_stats_published_at;
ALTER INDEX IF EXISTS idx_stats_category RENAME TO idx_collection_stats_category;
ALTER INDEX IF EXISTS idx_stats_year RENAME TO idx_collection_stats_year;

-- Step 3: Rename primary key constraint (if needed)
ALTER INDEX IF EXISTS stats_pkey RENAME TO collection_stats_pkey;

-- Verify the rename
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'collection_stats'
GROUP BY table_name;

-- Verify indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'collection_stats'
ORDER BY indexname;

