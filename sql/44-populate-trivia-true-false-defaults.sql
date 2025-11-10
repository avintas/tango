-- Migration 44: Set defaults for trivia_true_false table
-- Purpose: Populate difficulty, attribution, and category fields
-- Date: 2024

-- Verification query - check current state
-- SELECT 
--   COUNT(*) as total_records,
--   COUNT(CASE WHEN difficulty IS NULL THEN 1 END) as null_difficulty,
--   COUNT(CASE WHEN attribution IS NULL THEN 1 END) as null_attribution,
--   COUNT(CASE WHEN category IS NULL THEN 1 END) as null_category,
--   theme,
--   COUNT(*) as count_by_theme
-- FROM public.trivia_true_false
-- GROUP BY theme;

-- =============================================================================
-- STEP 1: Set difficulty to "easy" for all records
-- =============================================================================
UPDATE public.trivia_true_false
SET difficulty = 'easy'
WHERE difficulty IS NULL OR difficulty != 'easy';

-- =============================================================================
-- STEP 2: Set attribution to "internal" for all records
-- =============================================================================
UPDATE public.trivia_true_false
SET attribution = 'internal'
WHERE attribution IS NULL OR attribution != 'internal';

-- =============================================================================
-- STEP 3: Set categories based on theme
-- =============================================================================

-- Theme: "Teams & Organizations" → category = "Team"
-- Update records that currently have "teams" (with 's') to "Team"
UPDATE public.trivia_true_false
SET category = 'Team'
WHERE theme = 'Teams & Organizations'
  AND category = 'teams';

-- Theme: "Awards & Honors" → category = "Honors"
UPDATE public.trivia_true_false
SET category = 'Honors'
WHERE theme = 'Awards & Honors'
  AND category IS NULL;

-- Theme: "Leadership & Staff" → category = "Coaching"
UPDATE public.trivia_true_false
SET category = 'Coaching'
WHERE theme = 'Leadership & Staff'
  AND category IS NULL;

-- Theme: "Players" → category = "Player Spotlight"
UPDATE public.trivia_true_false
SET category = 'Player Spotlight'
WHERE theme = 'Players'
  AND category IS NULL;

-- Theme: "Venues & Locations" → category = "Location"
UPDATE public.trivia_true_false
SET category = 'Location'
WHERE theme = 'Venues & Locations'
  AND category IS NULL;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify difficulty distribution
-- SELECT 
--   difficulty,
--   COUNT(*) as count
-- FROM public.trivia_true_false
-- GROUP BY difficulty
-- ORDER BY difficulty;

-- Verify attribution distribution
-- SELECT 
--   attribution,
--   COUNT(*) as count
-- FROM public.trivia_true_false
-- GROUP BY attribution
-- ORDER BY attribution;

-- Verify category distribution by theme
-- SELECT 
--   theme,
--   category,
--   COUNT(*) as count
-- FROM public.trivia_true_false
-- GROUP BY theme, category
-- ORDER BY theme, category;

