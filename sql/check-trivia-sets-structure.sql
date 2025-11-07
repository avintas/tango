-- Safe Verification Script for trivia_sets Table
-- Run this in Supabase SQL Editor to check current structure
-- This is READ-ONLY - no modifications

-- ============================================================================
-- 1. Check Table Exists
-- ============================================================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'trivia_sets'
    ) 
    THEN '✅ Table exists'
    ELSE '❌ Table does NOT exist'
  END as table_status;

-- ============================================================================
-- 2. Check Column Structure
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name = 'id' THEN '✅ Primary Key'
    WHEN column_name = 'slug' THEN 'Check unique constraint below'
    ELSE ''
  END as notes
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'trivia_sets'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. Check Constraints (especially slug uniqueness)
-- ============================================================================
SELECT 
  constraint_name,
  constraint_type,
  CASE 
    WHEN constraint_name LIKE '%slug%' AND constraint_type = 'UNIQUE' 
    THEN '✅ Slug is unique'
    WHEN constraint_name LIKE '%slug%' 
    THEN '⚠️ Slug constraint exists but not unique'
    ELSE ''
  END as status
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
  AND table_name = 'trivia_sets';

-- ============================================================================
-- 4. Check Indexes
-- ============================================================================
SELECT 
  indexname,
  CASE 
    WHEN indexname LIKE '%status%' THEN '✅ Status index'
    WHEN indexname LIKE '%theme%' THEN '✅ Theme index'
    WHEN indexname LIKE '%category%' THEN '✅ Category index'
    WHEN indexname LIKE '%slug%' THEN '✅ Slug index'
    WHEN indexname LIKE '%published%' THEN '✅ Published index'
    WHEN indexname LIKE '%created%' THEN '✅ Created index'
    ELSE 'Other index'
  END as status
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'trivia_sets';

-- ============================================================================
-- 5. Summary Check
-- ============================================================================
SELECT 
  'Summary' as check_type,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = 'trivia_sets') as column_count,
  (SELECT COUNT(*) FROM information_schema.table_constraints 
   WHERE table_schema = 'public' AND table_name = 'trivia_sets') as constraint_count,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE schemaname = 'public' AND tablename = 'trivia_sets') as index_count,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' 
        AND table_name = 'trivia_sets'
        AND constraint_name LIKE '%slug%'
        AND constraint_type = 'UNIQUE'
    ) THEN '✅ Slug is unique'
    ELSE '⚠️ Slug needs unique constraint'
  END as slug_status;

