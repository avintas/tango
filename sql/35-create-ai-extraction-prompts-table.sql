-- Migration 35: Create ai_extraction_prompts table
-- Purpose: Store user-provided AI prompts for metadata extraction and content enrichment
-- Note: Prompts are not hardcoded - stored in database for easy editing

CREATE TABLE IF NOT EXISTS public.ai_extraction_prompts (
  id BIGSERIAL PRIMARY KEY,
  prompt_name TEXT NOT NULL,                    -- User-friendly name (e.g., "Hockey Theme Extraction")
  prompt_type TEXT NOT NULL,                    -- 'metadata_extraction' or 'content_enrichment'
  prompt_content TEXT NOT NULL,                 -- The actual prompt text
  description TEXT,                             -- Optional description of what this prompt does
  is_active BOOLEAN NOT NULL DEFAULT true,      -- Only active prompts are used
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT prompt_type_check CHECK (prompt_type IN ('metadata_extraction', 'content_enrichment'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active 
  ON public.ai_extraction_prompts(is_active, prompt_type) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_ai_prompts_type 
  ON public.ai_extraction_prompts(prompt_type);

CREATE INDEX IF NOT EXISTS idx_ai_prompts_created_by 
  ON public.ai_extraction_prompts(created_by);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_prompt_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER on_prompt_update
BEFORE UPDATE ON public.ai_extraction_prompts
FOR EACH ROW
EXECUTE PROCEDURE public.handle_prompt_update();

