-- Create Who Am I Trivia Table
-- Following Content Library Table Pattern
-- Date: October 30, 2025

CREATE TABLE IF NOT EXISTS public.trivia_who_am_i (
  -- Primary Key
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Core Content Fields (WHO AM I SPECIFIC)
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,

  -- Metadata & Classification (STANDARD)
  category TEXT,
  theme TEXT,
  difficulty TEXT,
  tags TEXT[],
  attribution TEXT,

  -- Status & Workflow (STANDARD)
  status TEXT DEFAULT 'draft',
  used_in TEXT[],
  source_content_id BIGINT,
  display_order INTEGER,

  -- Timestamps (STANDARD)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Standard Indexes
CREATE INDEX IF NOT EXISTS idx_trivia_who_am_i_status
  ON public.trivia_who_am_i(status);

CREATE INDEX IF NOT EXISTS idx_trivia_who_am_i_category
  ON public.trivia_who_am_i(category);

CREATE INDEX IF NOT EXISTS idx_trivia_who_am_i_difficulty
  ON public.trivia_who_am_i(difficulty);

CREATE INDEX IF NOT EXISTS idx_trivia_who_am_i_created_at
  ON public.trivia_who_am_i(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trivia_who_am_i_published_at
  ON public.trivia_who_am_i(published_at DESC);

-- Table and Column Comments
COMMENT ON TABLE public.trivia_who_am_i IS 'Dedicated table for "Who Am I?" trivia questions';
COMMENT ON COLUMN public.trivia_who_am_i.question_text IS 'The Who Am I question text';
COMMENT ON COLUMN public.trivia_who_am_i.correct_answer IS 'The correct answer (who the question is about)';
COMMENT ON COLUMN public.trivia_who_am_i.explanation IS 'Optional explanation for the answer';
COMMENT ON COLUMN public.trivia_who_am_i.category IS 'Category classification (e.g., "Players", "Teams", "Historical")';
COMMENT ON COLUMN public.trivia_who_am_i.theme IS 'Theme classification';
COMMENT ON COLUMN public.trivia_who_am_i.difficulty IS 'Difficulty level: Easy, Medium, Hard';
COMMENT ON COLUMN public.trivia_who_am_i.tags IS 'Array of keywords for searching';
COMMENT ON COLUMN public.trivia_who_am_i.attribution IS 'Source attribution';
COMMENT ON COLUMN public.trivia_who_am_i.status IS 'Workflow status: draft, published, archived';
COMMENT ON COLUMN public.trivia_who_am_i.used_in IS 'Array tracking where this question has been used';
COMMENT ON COLUMN public.trivia_who_am_i.source_content_id IS 'Foreign key to source material if applicable';
COMMENT ON COLUMN public.trivia_who_am_i.display_order IS 'Manual ordering';
COMMENT ON COLUMN public.trivia_who_am_i.published_at IS 'Timestamp when first published';
COMMENT ON COLUMN public.trivia_who_am_i.archived_at IS 'Timestamp when archived';

