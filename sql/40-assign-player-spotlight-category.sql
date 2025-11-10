-- Migration 40: Assign "Player Spotlight" category to all Players theme questions
-- Purpose: Populate category field for all trivia_multiple_choice records with theme = "Players"
-- Date: 2024

-- Verification query - check how many records will be updated
-- SELECT 
--   COUNT(*) as records_to_update,
--   COUNT(CASE WHEN category IS NULL THEN 1 END) as currently_null,
--   COUNT(CASE WHEN category IS NOT NULL THEN 1 END) as already_has_category
-- FROM public.trivia_multiple_choice
-- WHERE theme = 'Players';

-- Assign "Player Spotlight" category to all Players theme questions
UPDATE public.trivia_multiple_choice
SET category = 'Player Spotlight'
WHERE theme = 'Players'
  AND category IS NULL;

-- Verify update
-- SELECT 
--   theme,
--   category,
--   COUNT(*) as count
-- FROM public.trivia_multiple_choice
-- WHERE theme = 'Players'
-- GROUP BY theme, category
-- ORDER BY category;

