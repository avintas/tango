-- Migration 45: Update category from "Teams" (plural) to "Team" (singular)
-- Purpose: Standardize category naming by converting plural "Teams" to singular "Team"
-- Date: 2024

-- Verification query - check how many records will be updated
-- SELECT 
--   category,
--   COUNT(*) as count
-- FROM public.trivia_true_false
-- WHERE category = 'Teams'
-- GROUP BY category;

-- Update category from "Teams" (exact match) to "Team"
UPDATE public.trivia_true_false
SET category = 'Team'
WHERE category = 'Teams';

-- Verification query - confirm update (should return 0 records with "Teams")
-- SELECT 
--   category,
--   COUNT(*) as count
-- FROM public.trivia_true_false
-- WHERE category = 'Teams'
-- GROUP BY category;

