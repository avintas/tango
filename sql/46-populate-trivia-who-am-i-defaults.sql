-- Migration 46: Populate default difficulty, attribution, and categories for trivia_who_am_i
-- Purpose: Standardize metadata for Who Am I trivia questions
-- Date: 2024

-- =============================================================================
-- VERIFICATION QUERY - Check current state
-- =============================================================================
-- SELECT 
--   COUNT(*) as total_records,
--   COUNT(CASE WHEN difficulty IS NULL THEN 1 END) as null_difficulty,
--   COUNT(CASE WHEN attribution IS NULL THEN 1 END) as null_attribution,
--   COUNT(CASE WHEN category IS NULL THEN 1 END) as null_category,
--   theme,
--   COUNT(*) as count_by_theme
-- FROM public.trivia_who_am_i
-- GROUP BY theme;

-- =============================================================================
-- STEP 1: Set difficulty to "easy" for all records
-- =============================================================================
UPDATE public.trivia_who_am_i
SET difficulty = 'easy';

-- =============================================================================
-- STEP 2: Set attribution to "internal" for all records
-- =============================================================================
UPDATE public.trivia_who_am_i
SET attribution = 'internal';

-- =============================================================================
-- STEP 3: Set categories based on theme
-- =============================================================================

-- Theme: "Players" → category = "Player"
UPDATE public.trivia_who_am_i
SET category = 'Player'
WHERE theme = 'Players';

-- Theme: "Awards & Honors" → category = "Honors"
UPDATE public.trivia_who_am_i
SET category = 'Honors'
WHERE theme = 'Awards & Honors';

-- Theme: "Teams & Organizations" → category = "Team"
UPDATE public.trivia_who_am_i
SET category = 'Team'
WHERE theme = 'Teams & Organizations';

-- Theme: "Venues & Locations" → category = "Location"
UPDATE public.trivia_who_am_i
SET category = 'Location'
WHERE theme = 'Venues & Locations';

-- Theme: "Leadership & Staff" → category = "Coaching"
UPDATE public.trivia_who_am_i
SET category = 'Coaching'
WHERE theme = 'Leadership & Staff';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify difficulty distribution
-- SELECT 
--   difficulty,
--   COUNT(*) as count
-- FROM public.trivia_who_am_i
-- GROUP BY difficulty
-- ORDER BY difficulty;

-- Verify attribution distribution
-- SELECT 
--   attribution,
--   COUNT(*) as count
-- FROM public.trivia_who_am_i
-- GROUP BY attribution
-- ORDER BY attribution;

-- Verify category distribution by theme
-- SELECT 
--   theme,
--   category,
--   COUNT(*) as count
-- FROM public.trivia_who_am_i
-- GROUP BY theme, category
-- ORDER BY theme, category;

-- Verify remaining NULL categories by theme
-- SELECT 
--   theme,
--   COUNT(*) as null_category_count
-- FROM public.trivia_who_am_i
-- WHERE category IS NULL
-- GROUP BY theme
-- ORDER BY null_category_count DESC;

