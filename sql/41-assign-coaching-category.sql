-- Migration 41: Assign "Coaching" category to all Leadership & Staff theme questions
-- Purpose: Populate category field for all trivia_multiple_choice records with theme = "Leadership & Staff"
-- Date: 2024

-- Verification query - check how many records will be updated
-- SELECT 
--   COUNT(*) as records_to_update,
--   COUNT(CASE WHEN category IS NULL THEN 1 END) as currently_null,
--   COUNT(CASE WHEN category IS NOT NULL THEN 1 END) as already_has_category
-- FROM public.trivia_multiple_choice
-- WHERE theme = 'Leadership & Staff';

-- Assign "Coaching" category to all Leadership & Staff theme questions
UPDATE public.trivia_multiple_choice
SET category = 'Coaching'
WHERE theme = 'Leadership & Staff'
  AND category IS NULL;

-- Verify update
-- SELECT 
--   theme,
--   category,
--   COUNT(*) as count
-- FROM public.trivia_multiple_choice
-- WHERE theme = 'Leadership & Staff'
-- GROUP BY theme, category
-- ORDER BY category;

