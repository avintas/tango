-- =============================================================================
-- CREATE MULTIPLE CHOICE TRIVIA TABLE
-- =============================================================================
-- 
-- Purpose: Dedicated table for multiple-choice trivia questions
-- Pattern: Content Library Table Pattern (see docs/CONTENT-LIBRARY-TABLE-PATTERN.md)
-- Related: Migrated from trivia_questions table WHERE question_type = 'multiple-choice'
-- 
-- Created: October 30, 2025
-- 
-- =============================================================================

-- Drop table if exists (for development/testing)
-- DROP TABLE IF EXISTS public.multiple_choice_trivia CASCADE;

CREATE TABLE IF NOT EXISTS public.multiple_choice_trivia (
  -- =========================================================================
  -- PRIMARY KEY
  -- =========================================================================
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- =========================================================================
  -- CONTENT-SPECIFIC FIELDS (Multiple Choice)
  -- =========================================================================
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  explanation TEXT,

  -- =========================================================================
  -- STANDARD METADATA FIELDS
  -- =========================================================================
  category TEXT,
  theme TEXT,
  difficulty TEXT,
  tags TEXT[],
  attribution TEXT,

  -- =========================================================================
  -- STANDARD WORKFLOW & TRACKING FIELDS
  -- =========================================================================
  status TEXT DEFAULT 'draft',
  used_in TEXT[],
  source_content_id BIGINT,
  display_order INTEGER,

  -- =========================================================================
  -- STANDARD TIMESTAMPS
  -- =========================================================================
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Status filtering (for workflow: draft, published, archived)
CREATE INDEX IF NOT EXISTS idx_mct_status 
  ON public.multiple_choice_trivia(status);

-- Category filtering (for content organization)
CREATE INDEX IF NOT EXISTS idx_mct_category 
  ON public.multiple_choice_trivia(category);

-- Difficulty filtering (for content selection)
CREATE INDEX IF NOT EXISTS idx_mct_difficulty 
  ON public.multiple_choice_trivia(difficulty);

-- Recent items (for CMS display, newest first)
CREATE INDEX IF NOT EXISTS idx_mct_created_at 
  ON public.multiple_choice_trivia(created_at DESC);

-- Published items (for public queries, newest first)
CREATE INDEX IF NOT EXISTS idx_mct_published_at 
  ON public.multiple_choice_trivia(published_at DESC);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.multiple_choice_trivia IS 
  'Dedicated table for multiple-choice trivia questions with 1 correct answer and 3 wrong answers';

COMMENT ON COLUMN public.multiple_choice_trivia.id IS 
  'Unique identifier for the multiple-choice question';

COMMENT ON COLUMN public.multiple_choice_trivia.question_text IS 
  'The multiple-choice trivia question text';

COMMENT ON COLUMN public.multiple_choice_trivia.correct_answer IS 
  'The correct answer to the question';

COMMENT ON COLUMN public.multiple_choice_trivia.wrong_answers IS 
  'Array of 3 incorrect answers (distractors)';

COMMENT ON COLUMN public.multiple_choice_trivia.explanation IS 
  'Optional explanation for why the correct answer is correct';

COMMENT ON COLUMN public.multiple_choice_trivia.category IS 
  'Content category (e.g., Players, Teams, History, Rules)';

COMMENT ON COLUMN public.multiple_choice_trivia.theme IS 
  'Thematic classification (e.g., Hockey History, Current Events, NHL Records)';

COMMENT ON COLUMN public.multiple_choice_trivia.difficulty IS 
  'Difficulty level: Easy, Medium, Hard';

COMMENT ON COLUMN public.multiple_choice_trivia.tags IS 
  'Array of searchable keywords';

COMMENT ON COLUMN public.multiple_choice_trivia.attribution IS 
  'Source attribution (e.g., NHL.com, Hockey Reference)';

COMMENT ON COLUMN public.multiple_choice_trivia.status IS 
  'Workflow status: draft, published, archived';

COMMENT ON COLUMN public.multiple_choice_trivia.used_in IS 
  'Array tracking where this question has been used';

COMMENT ON COLUMN public.multiple_choice_trivia.source_content_id IS 
  'Foreign key to source material (e.g., original trivia_questions ID)';

COMMENT ON COLUMN public.multiple_choice_trivia.display_order IS 
  'Manual ordering for presentation';

COMMENT ON COLUMN public.multiple_choice_trivia.created_at IS 
  'Timestamp when record was created';

COMMENT ON COLUMN public.multiple_choice_trivia.updated_at IS 
  'Timestamp when record was last updated';

COMMENT ON COLUMN public.multiple_choice_trivia.published_at IS 
  'Timestamp when first published (null if never published)';

COMMENT ON COLUMN public.multiple_choice_trivia.archived_at IS 
  'Timestamp when archived (null if not archived)';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify table was created
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'multiple_choice_trivia';

-- Verify columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'multiple_choice_trivia'
ORDER BY ordinal_position;

-- Verify indexes
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'multiple_choice_trivia';

-- =============================================================================
-- NOTES
-- =============================================================================
-- 
-- Migration Process:
-- 1. Run this file to create the table
-- 2. Run 26-migrate-multiple-choice-from-questions.sql to migrate data
-- 3. Update app/api/trivia/save-multiple-choice/route.ts to save to this table
-- 4. Create CMS page at /cms/multiple-choice-trivia-library
-- 5. Create public API at /api/public/multiple-choice-trivia
-- 
-- =============================================================================

