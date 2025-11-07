-- Create trivia_sets_who_am_i table
-- Stores curated Who Am I trivia sets - complete playable games
-- Each set contains only Who Am I questions

CREATE TABLE IF NOT EXISTS public.trivia_sets_who_am_i (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  
  -- Organization & Categorization
  category VARCHAR(100),
  theme VARCHAR(100),
  difficulty VARCHAR(20) DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[] DEFAULT '{}',
  
  -- Question Data (Embedded JSON) - WHO AM I SPECIFIC
  -- Format: Array of Who Am I question objects
  -- Each question: { question_text, correct_answer, explanation, clues[], hints[], image_url, ... }
  question_data JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  question_count INTEGER NOT NULL CHECK (question_count > 0),
  estimated_duration INTEGER, -- Minutes to complete
  
  -- Workflow & Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published')),
  visibility VARCHAR(20) DEFAULT 'Private'
    CHECK (visibility IN ('Public', 'Unlisted', 'Private')),
  
  -- Publishing & Scheduling
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT scheduled_date_required CHECK (
    (status = 'scheduled' AND scheduled_for IS NOT NULL) OR
    (status != 'scheduled')
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trivia_sets_wai_status 
  ON public.trivia_sets_who_am_i(status);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_wai_category 
  ON public.trivia_sets_who_am_i(category);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_wai_difficulty 
  ON public.trivia_sets_who_am_i(difficulty);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_wai_theme 
  ON public.trivia_sets_who_am_i(theme);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trivia_sets_wai_slug 
  ON public.trivia_sets_who_am_i(slug);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_wai_created_at 
  ON public.trivia_sets_who_am_i(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_wai_published_at 
  ON public.trivia_sets_who_am_i(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_wai_visibility 
  ON public.trivia_sets_who_am_i(visibility);

-- GIN index for JSONB queries (searching within question_data)
CREATE INDEX IF NOT EXISTS idx_trivia_sets_wai_question_data_gin 
  ON public.trivia_sets_who_am_i USING GIN (question_data);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trivia_sets_wai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trivia_sets_wai_updated_at_trigger
  BEFORE UPDATE ON public.trivia_sets_who_am_i
  FOR EACH ROW
  EXECUTE FUNCTION update_trivia_sets_wai_updated_at();

-- Comments
COMMENT ON TABLE public.trivia_sets_who_am_i IS 
  'Curated Who Am I trivia sets - complete playable games with only Who Am I questions';

COMMENT ON COLUMN public.trivia_sets_who_am_i.question_data IS 
  'JSONB array of Who Am I questions. Each contains: question_text, correct_answer, explanation, tags, difficulty, points. Optional: clues[], hints[], image_url for progressive/hint-based gameplay';

COMMENT ON COLUMN public.trivia_sets_who_am_i.status IS 
  'Workflow status: draft (being created), scheduled (will publish at scheduled_for), published (live)';

COMMENT ON COLUMN public.trivia_sets_who_am_i.visibility IS 
  'Access level: Public (everyone), Unlisted (link only), Private (admin only)';

COMMENT ON COLUMN public.trivia_sets_who_am_i.scheduled_for IS 
  'When this set should be published (for scheduled publishing). Required if status=scheduled';

COMMENT ON COLUMN public.trivia_sets_who_am_i.estimated_duration IS 
  'Estimated time to complete this trivia set in minutes';

