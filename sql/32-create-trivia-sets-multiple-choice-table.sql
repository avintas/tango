-- Create trivia_sets_multiple_choice table
-- Stores curated Multiple Choice trivia sets - complete playable games
-- Each set contains only Multiple Choice questions

CREATE TABLE IF NOT EXISTS public.trivia_sets_multiple_choice (
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
  
  -- Question Data (Embedded JSON) - MULTIPLE CHOICE SPECIFIC
  -- Format: Array of Multiple Choice question objects
  -- Each question: { question_text, correct_answer, wrong_answers[], explanation, ... }
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
CREATE INDEX IF NOT EXISTS idx_trivia_sets_mc_status 
  ON public.trivia_sets_multiple_choice(status);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_mc_category 
  ON public.trivia_sets_multiple_choice(category);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_mc_difficulty 
  ON public.trivia_sets_multiple_choice(difficulty);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_mc_theme 
  ON public.trivia_sets_multiple_choice(theme);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trivia_sets_mc_slug 
  ON public.trivia_sets_multiple_choice(slug);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_mc_created_at 
  ON public.trivia_sets_multiple_choice(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_mc_published_at 
  ON public.trivia_sets_multiple_choice(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_trivia_sets_mc_visibility 
  ON public.trivia_sets_multiple_choice(visibility);

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_trivia_sets_mc_question_data_gin 
  ON public.trivia_sets_multiple_choice USING GIN (question_data);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trivia_sets_mc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trivia_sets_mc_updated_at_trigger
  BEFORE UPDATE ON public.trivia_sets_multiple_choice
  FOR EACH ROW
  EXECUTE FUNCTION update_trivia_sets_mc_updated_at();

-- Comments
COMMENT ON TABLE public.trivia_sets_multiple_choice IS 
  'Curated Multiple Choice trivia sets - complete playable games with only Multiple Choice questions';

COMMENT ON COLUMN public.trivia_sets_multiple_choice.question_data IS 
  'JSONB array of Multiple Choice questions. Each contains: question_text, correct_answer, wrong_answers[], explanation, tags, difficulty, points. Future: image_url, audio_url, video_url for multimedia questions';

COMMENT ON COLUMN public.trivia_sets_multiple_choice.status IS 
  'Workflow status: draft (being created), scheduled (will publish at scheduled_for), published (live)';

COMMENT ON COLUMN public.trivia_sets_multiple_choice.visibility IS 
  'Access level: Public (everyone), Unlisted (link only), Private (admin only)';

COMMENT ON COLUMN public.trivia_sets_multiple_choice.scheduled_for IS 
  'When this set should be published (for scheduled publishing). Required if status=scheduled';

COMMENT ON COLUMN public.trivia_sets_multiple_choice.estimated_duration IS 
  'Estimated time to complete this trivia set in minutes';

