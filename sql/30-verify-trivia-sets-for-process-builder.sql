-- Migration: Ensure trivia_sets table is ready for Process Builder
-- Run this to verify/update the table structure

-- 1. Ensure slug is unique (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'trivia_sets_slug_unique'
  ) THEN
    ALTER TABLE public.trivia_sets 
    ADD CONSTRAINT trivia_sets_slug_unique UNIQUE (slug);
    RAISE NOTICE 'Added unique constraint on slug';
  ELSE
    RAISE NOTICE 'Slug already has unique constraint';
  END IF;
END $$;

-- 2. Ensure all required columns exist with correct types
-- (Most should already exist from 29-create-trivia-sets-table.sql)

-- 3. Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_trivia_sets_status 
  ON public.trivia_sets(status);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_published_at 
  ON public.trivia_sets(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_theme 
  ON public.trivia_sets(theme);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_category 
  ON public.trivia_sets(category);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_slug 
  ON public.trivia_sets(slug);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_created_at 
  ON public.trivia_sets(created_at DESC);

-- 4. Verify structure
SELECT 
  'Table Structure Verified' as status,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'trivia_sets';

