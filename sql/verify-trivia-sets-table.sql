-- Verify and update trivia_sets table structure for Process Builder
-- This ensures the table matches what Process Builder needs

-- Check current structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'trivia_sets'
ORDER BY ordinal_position;

-- Expected structure for Process Builder:
-- id BIGSERIAL PRIMARY KEY
-- title VARCHAR NOT NULL
-- slug VARCHAR (should be UNIQUE)
-- description TEXT
-- category VARCHAR
-- theme VARCHAR
-- difficulty VARCHAR
-- tags TEXT[]
-- question_data JSONB NOT NULL
-- question_count INTEGER
-- status VARCHAR NOT NULL (draft, published, archived)
-- visibility VARCHAR (Public, Unlisted, Private)
-- published_at TIMESTAMPTZ
-- scheduled_for TIMESTAMPTZ
-- created_at TIMESTAMPTZ DEFAULT NOW()
-- updated_at TIMESTAMPTZ DEFAULT NOW()

-- Add any missing columns if needed
-- (Run these only if columns don't exist)

-- Make slug unique if not already
-- ALTER TABLE public.trivia_sets ADD CONSTRAINT trivia_sets_slug_unique UNIQUE (slug);

-- Verify indexes exist
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'trivia_sets';

