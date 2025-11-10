-- Migration 43: Set difficulty to "easy" and attribution to "internal" for all trivia_multiple_choice records
-- Purpose: Populate default values for difficulty and attribution fields
-- Date: 2024

-- Verification query - check current state
-- SELECT 
--   COUNT(*) as total_records,
--   COUNT(CASE WHEN difficulty IS NULL THEN 1 END) as null_difficulty,
--   COUNT(CASE WHEN difficulty IS NOT NULL THEN 1 END) as has_difficulty,
--   COUNT(CASE WHEN attribution IS NULL THEN 1 END) as null_attribution,
--   COUNT(CASE WHEN attribution IS NOT NULL THEN 1 END) as has_attribution
-- FROM public.trivia_multiple_choice;

-- Set difficulty to "easy" for all records (update NULL and existing values)
UPDATE public.trivia_multiple_choice
SET difficulty = 'easy'
WHERE difficulty IS NULL OR difficulty != 'easy';

-- Set attribution to "internal" for all records (update NULL and existing values)
UPDATE public.trivia_multiple_choice
SET attribution = 'internal'
WHERE attribution IS NULL OR attribution != 'internal';

-- Verify updates
-- SELECT 
--   difficulty,
--   COUNT(*) as count
-- FROM public.trivia_multiple_choice
-- GROUP BY difficulty
-- ORDER BY difficulty;

-- SELECT 
--   attribution,
--   COUNT(*) as count
-- FROM public.trivia_multiple_choice
-- GROUP BY attribution
-- ORDER BY attribution;

