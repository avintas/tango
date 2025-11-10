-- =============================================================================
-- CREATE TRIVIA SETS RECIPES TABLE
-- =============================================================================
-- 
-- Purpose: Store reusable recipe templates for building trivia sets
-- Pattern: Recipe system for trivia set building
-- Related: Used by process builders and trivia set creation
-- Table name: trivia_sets_recipes (consistent with trivia_sets_* naming)
-- 
-- Created: January 15, 2025
-- 
-- =============================================================================

-- Drop table if exists (for development/testing)
-- DROP TABLE IF EXISTS public.trivia_sets_recipes CASCADE;

CREATE TABLE IF NOT EXISTS public.trivia_sets_recipes (
  -- =========================================================================
  -- PRIMARY KEY
  -- =========================================================================
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- =========================================================================
  -- BASIC INFORMATION
  -- =========================================================================
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- =========================================================================
  -- RECIPE PARAMETERS (Category-bound selection)
  -- =========================================================================
  category VARCHAR(255) NOT NULL,
  theme VARCHAR(255), -- Reference only, not a filter
  question_types TEXT[] NOT NULL, -- ['multiple-choice', 'true-false', 'who-am-i']
  bag_type VARCHAR(50) NOT NULL, -- 'category-bound-mc', 'category-bound-tf', 'category-bound-mix'

  -- =========================================================================
  -- QUANTITY PARAMETERS
  -- =========================================================================
  quantity_min INTEGER DEFAULT 1 NOT NULL CHECK (quantity_min >= 1),
  quantity_max INTEGER DEFAULT 20 NOT NULL CHECK (quantity_max <= 20),
  quantity_default INTEGER DEFAULT 10 NOT NULL CHECK (quantity_default >= quantity_min AND quantity_default <= quantity_max),

  -- =========================================================================
  -- COOLDOWN PARAMETERS
  -- =========================================================================
  cooldown_days INTEGER CHECK (cooldown_days >= 0),
  cooldown_enabled BOOLEAN DEFAULT true NOT NULL,

  -- =========================================================================
  -- SELECTION PARAMETERS
  -- =========================================================================
  selection_method VARCHAR(50) DEFAULT 'random' NOT NULL CHECK (selection_method IN ('random')),

  -- =========================================================================
  -- EXECUTION MODE
  -- =========================================================================
  execution_mode VARCHAR(50) DEFAULT 'auto' NOT NULL CHECK (execution_mode IN ('auto', 'manual')),

  -- =========================================================================
  -- METADATA & TRACKING
  -- =========================================================================
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by VARCHAR(255),
  usage_count INTEGER DEFAULT 0 NOT NULL CHECK (usage_count >= 0),
  last_used_at TIMESTAMPTZ
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Index for category lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_trivia_sets_recipes_category ON public.trivia_sets_recipes(category);

-- Index for theme lookups (reference queries)
CREATE INDEX IF NOT EXISTS idx_trivia_sets_recipes_theme ON public.trivia_sets_recipes(theme);

-- Index for bag type queries
CREATE INDEX IF NOT EXISTS idx_trivia_sets_recipes_bag_type ON public.trivia_sets_recipes(bag_type);

-- Index for execution mode queries
CREATE INDEX IF NOT EXISTS idx_trivia_sets_recipes_execution_mode ON public.trivia_sets_recipes(execution_mode);

-- Index for name searches
CREATE INDEX IF NOT EXISTS idx_trivia_sets_recipes_name ON public.trivia_sets_recipes(name);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.trivia_sets_recipes IS 'Reusable recipe templates for building trivia sets';
COMMENT ON COLUMN public.trivia_sets_recipes.category IS 'Category is the lighthouse/beacon - primary selector for question pool';
COMMENT ON COLUMN public.trivia_sets_recipes.theme IS 'Theme is reference only - not used as a filter';
COMMENT ON COLUMN public.trivia_sets_recipes.question_types IS 'Array of question types: multiple-choice, true-false, who-am-i';
COMMENT ON COLUMN public.trivia_sets_recipes.bag_type IS 'Type of question bag: category-bound-mc (MC only), category-bound-tf (TF only), category-bound-mix (mixed)';
COMMENT ON COLUMN public.trivia_sets_recipes.quantity_min IS 'Minimum number of questions (1-20)';
COMMENT ON COLUMN public.trivia_sets_recipes.quantity_max IS 'Maximum number of questions (1-20)';
COMMENT ON COLUMN public.trivia_sets_recipes.quantity_default IS 'Default number of questions to select';
COMMENT ON COLUMN public.trivia_sets_recipes.cooldown_days IS 'Number of days to exclude recently used questions (flexible, not fixed)';
COMMENT ON COLUMN public.trivia_sets_recipes.cooldown_enabled IS 'Whether cooldown filter is active';
COMMENT ON COLUMN public.trivia_sets_recipes.selection_method IS 'Method for selecting questions (currently only random)';
COMMENT ON COLUMN public.trivia_sets_recipes.execution_mode IS 'Execution mode: auto (system builds set) or manual (user selects questions)';
COMMENT ON COLUMN public.trivia_sets_recipes.usage_count IS 'Number of times recipe has been used';
COMMENT ON COLUMN public.trivia_sets_recipes.last_used_at IS 'Timestamp of last recipe execution';

-- =============================================================================
-- TRIGGER: Update updated_at timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION update_recipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trivia_sets_recipes_updated_at
  BEFORE UPDATE ON public.trivia_sets_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_recipes_updated_at();

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify table creation
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'trivia_sets_recipes'
-- ORDER BY ordinal_position;

-- Verify indexes
-- SELECT 
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename = 'trivia_sets_recipes'
-- ORDER BY indexname;

