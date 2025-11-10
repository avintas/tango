-- Migration 42: Assign "Game Day" category to all Teams & Organizations theme questions
-- Purpose: Populate category field for all trivia_multiple_choice records with theme = "Teams & Organizations"
-- Date: 2024

-- Verification query - check how many records will be updated
-- SELECT 
--   COUNT(*) as records_to_update,
--   COUNT(CASE WHEN category IS NULL THEN 1 END) as currently_null,
--   COUNT(CASE WHEN category IS NOT NULL THEN 1 END) as already_has_category
-- FROM public.trivia_multiple_choice
-- WHERE theme = 'Teams & Organizations';

-- Assign "Game Day" category to all Teams & Organizations theme questions
UPDATE public.trivia_multiple_choice
SET category = 'Game Day'
WHERE theme = 'Teams & Organizations'
  AND category IS NULL;

-- Verify update
-- SELECT 
--   theme,
--   category,
--   COUNT(*) as count
-- FROM public.trivia_multiple_choice
-- WHERE theme = 'Teams & Organizations'
-- GROUP BY theme, category
-- ORDER BY category;

