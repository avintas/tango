-- =============================================================================
-- MIGRATE MULTIPLE CHOICE TRIVIA FROM TRIVIA_QUESTIONS TABLE
-- =============================================================================
-- 
-- Purpose: Migrate multiple-choice questions from unified trivia_questions table
--          to dedicated multiple_choice_trivia table
-- 
-- Prerequisites: 
--   - Table created via 25-create-multiple-choice-trivia-table.sql
--   - Backup of trivia_questions table
-- 
-- Created: October 30, 2025
-- 
-- =============================================================================

-- =============================================================================
-- PRE-MIGRATION CHECKS
-- =============================================================================

-- Count existing multiple-choice questions in source table
SELECT COUNT(*) as total_multiple_choice_questions
FROM public.trivia_questions
WHERE question_type = 'multiple-choice';

-- Preview sample data to verify structure
SELECT 
  id,
  question_text,
  correct_answer,
  wrong_answers,
  explanation,
  theme,
  tags,
  status,
  created_at
FROM public.trivia_questions
WHERE question_type = 'multiple-choice'
LIMIT 5;

-- =============================================================================
-- MIGRATION
-- =============================================================================

INSERT INTO public.trivia_multiple_choice (
  question_text,
  correct_answer,
  wrong_answers,
  explanation,
  category,
  theme,
  difficulty,
  tags,
  attribution,
  status,
  source_content_id,
  created_at,
  updated_at,
  published_at,
  archived_at
)
SELECT 
  -- Content fields
  tq.question_text,
  tq.correct_answer,
  tq.wrong_answers,
  tq.explanation,
  
  -- Metadata fields
  NULL as category,  -- Not in original table
  tq.theme,
  NULL as difficulty,  -- Not in original table
  tq.tags,
  NULL as attribution,  -- Not in original table
  
  -- Workflow fields
  COALESCE(LOWER(TRIM(tq.status)), 'draft') as status,
  tq.id as source_content_id,  -- Link back to original question
  
  -- Timestamps
  tq.created_at,
  tq.updated_at,
  
  -- Status-based timestamps
  CASE 
    WHEN LOWER(TRIM(tq.status)) = 'published' THEN tq.updated_at 
    ELSE NULL 
  END as published_at,
  
  CASE 
    WHEN LOWER(TRIM(tq.status)) = 'archived' THEN tq.updated_at 
    ELSE NULL 
  END as archived_at

FROM public.trivia_questions tq
WHERE tq.question_type = 'multiple-choice';

-- =============================================================================
-- POST-MIGRATION VERIFICATION
-- =============================================================================

-- Count migrated records
SELECT COUNT(*) as migrated_count
FROM public.trivia_multiple_choice;

-- Verify no data loss (counts should match)
SELECT 
  (SELECT COUNT(*) FROM public.trivia_questions WHERE question_type = 'multiple-choice') as source_count,
  (SELECT COUNT(*) FROM public.trivia_multiple_choice) as destination_count,
  (SELECT COUNT(*) FROM public.trivia_questions WHERE question_type = 'multiple-choice') - 
  (SELECT COUNT(*) FROM public.trivia_multiple_choice) as difference;

-- Sample comparison: Source vs Destination
(
  SELECT 
    'SOURCE' as table_type,
    id,
    question_text,
    correct_answer,
    array_length(wrong_answers, 1) as wrong_answer_count,
    theme,
    status
  FROM public.trivia_questions
  WHERE question_type = 'multiple-choice'
  LIMIT 3
)

UNION ALL

(
  SELECT 
    'DESTINATION' as table_type,
    source_content_id as id,
    question_text,
    correct_answer,
    array_length(wrong_answers, 1) as wrong_answer_count,
    theme,
    status
  FROM public.trivia_multiple_choice
  LIMIT 3
)
ORDER BY table_type, id;

-- Check for any questions with wrong_answers array that isn't length 3
SELECT 
  id,
  question_text,
  array_length(wrong_answers, 1) as wrong_answer_count
FROM public.trivia_multiple_choice
WHERE array_length(wrong_answers, 1) != 3;

-- Status distribution
SELECT 
  status,
  COUNT(*) as count
FROM public.trivia_multiple_choice
GROUP BY status
ORDER BY count DESC;

-- Theme distribution
SELECT 
  theme,
  COUNT(*) as count
FROM public.trivia_multiple_choice
GROUP BY theme
ORDER BY count DESC
LIMIT 10;

-- =============================================================================
-- NOTES
-- =============================================================================
-- 
-- What Was Migrated:
-- - question_text → question_text
-- - correct_answer → correct_answer
-- - wrong_answers → wrong_answers (array)
-- - explanation → explanation
-- - theme → theme
-- - tags → tags
-- - status → status
-- - id → source_content_id (for provenance)
-- - created_at → created_at
-- - updated_at → updated_at
-- - Sets published_at for published items
-- - Sets archived_at for archived items
-- 
-- What Was NOT Migrated:
-- - category (didn't exist in trivia_questions)
-- - difficulty (didn't exist in trivia_questions)
-- - attribution (didn't exist in trivia_questions)
-- - created_by (internal CMS field, not needed)
-- 
-- Post-Migration Steps:
-- 1. Verify counts match
-- 2. Spot-check data accuracy
-- 3. Update save route: app/api/trivia/save-multiple-choice/route.ts
-- 4. Test generation workflow
-- 5. Consider archiving old trivia_questions (don't delete yet)
-- 
-- =============================================================================

