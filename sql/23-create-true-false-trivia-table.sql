-- Create the dedicated table for True/False trivia questions
CREATE TABLE IF NOT EXISTS public.true_false_trivia (
  -- Primary Key
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Content-Specific Fields
  question_text TEXT NOT NULL,
  is_true BOOLEAN NOT NULL,
  explanation TEXT,

  -- Standard Metadata Fields
  category TEXT,
  theme TEXT,
  difficulty TEXT,
  tags TEXT[],
  attribution TEXT,

  -- Standard Workflow & Tracking Fields
  status TEXT,
  used_in TEXT[],
  source_content_id BIGINT,
  display_order INTEGER,

  -- Standard Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Add comments for clarity
COMMENT ON TABLE public.true_false_trivia IS 'Stores True/False trivia questions, migrated from the unified trivia_sets table.';
COMMENT ON COLUMN public.true_false_trivia.question_text IS 'The trivia question statement.';
COMMENT ON COLUMN public.true_false_trivia.is_true IS 'The correct answer (true or false).';
COMMENT ON COLUMN public.true_false_trivia.explanation IS 'An optional explanation for the answer.';
COMMENT ON COLUMN public.true_false_trivia.source_content_id IS 'The ID of the original trivia_set this question came from.';

-- Standard indexes based on the Content Library Table Pattern
CREATE INDEX IF NOT EXISTS idx_tft_status ON public.true_false_trivia(status);
CREATE INDEX IF NOT EXISTS idx_tft_category ON public.true_false_trivia(category);
CREATE INDEX IF NOT EXISTS idx_tft_difficulty ON public.true_false_trivia(difficulty);
CREATE INDEX IF NOT EXISTS idx_tft_created_at ON public.true_false_trivia(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tft_published_at ON public.true_false_trivia(published_at DESC);
