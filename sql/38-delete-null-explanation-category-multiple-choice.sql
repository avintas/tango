-- Migration 38: Delete records from trivia_multiple_choice where both explanation and category are NULL
-- Purpose: Clean up incomplete records that lack both explanation and category information
-- Date: 2024

-- First, let's see how many records will be affected (for verification)
-- Run this query first to verify the count before deletion:
-- SELECT COUNT(*) as records_to_delete
-- FROM public.trivia_multiple_choice
-- WHERE explanation IS NULL AND category IS NULL;

-- Delete records where both explanation and category are NULL
DELETE FROM public.trivia_multiple_choice
WHERE explanation IS NULL 
  AND category IS NULL;

-- Verify deletion (should return 0)
-- SELECT COUNT(*) as remaining_null_records
-- FROM public.trivia_multiple_choice
-- WHERE explanation IS NULL AND category IS NULL;

