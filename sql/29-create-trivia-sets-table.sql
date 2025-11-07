-- Create trivia_sets table
-- Stores curated trivia sets with embedded question data (JSON)
-- Each set represents a complete, playable trivia game

CREATE TABLE IF NOT EXISTS public.trivia_sets (
    id BIGSERIAL PRIMARY KEY,
    
    -- Basic Information
    title VARCHAR NOT NULL,
    slug VARCHAR,
    description TEXT,
    
    -- Organization & Categorization
    category VARCHAR,
    theme VARCHAR,
    difficulty VARCHAR,
    tags TEXT[],
    
    -- Question Data (Embedded JSON)
    -- Stores complete question data as JSON array
    -- Format: [{question_text, question_type, correct_answer, wrong_answers, explanation, ...}]
    question_data JSONB NOT NULL,
    
    -- Workflow & Status
    status VARCHAR NOT NULL,
    visibility VARCHAR,
    
    -- Publishing & Scheduling
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    
    -- Metadata
    question_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trivia_sets_status ON public.trivia_sets(status);
CREATE INDEX IF NOT EXISTS idx_trivia_sets_published_at ON public.trivia_sets(published_at);
CREATE INDEX IF NOT EXISTS idx_trivia_sets_theme ON public.trivia_sets(theme);
CREATE INDEX IF NOT EXISTS idx_trivia_sets_category ON public.trivia_sets(category);
CREATE INDEX IF NOT EXISTS idx_trivia_sets_slug ON public.trivia_sets(slug);

-- Add comments for documentation
COMMENT ON TABLE public.trivia_sets IS 'Stores curated trivia sets - complete playable games with embedded question data';
COMMENT ON COLUMN public.trivia_sets.question_data IS 'JSONB array containing all questions for this set. Each question includes question_text, question_type, correct_answer, wrong_answers, explanation';
COMMENT ON COLUMN public.trivia_sets.status IS 'Set status: draft, published, archived';
COMMENT ON COLUMN public.trivia_sets.visibility IS 'Visibility level: Public, Unlisted, Private';
COMMENT ON COLUMN public.trivia_sets.scheduled_for IS 'When this set should be published (for scheduled publishing)';

