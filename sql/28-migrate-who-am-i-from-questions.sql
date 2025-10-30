-- Migrate Who Am I questions from trivia_questions to trivia_who_am_i
-- Date: October 30, 2025

-- Insert Who Am I questions from trivia_questions table
INSERT INTO public.trivia_who_am_i (
  question_text,
  correct_answer,
  explanation,
  theme,
  tags,
  status,
  source_content_id,
  created_at,
  updated_at,
  published_at,
  archived_at
)
SELECT
  tq.question_text,
  tq.correct_answer,
  tq.explanation,
  tq.theme,
  tq.tags,
  COALESCE(LOWER(TRIM(tq.status)), 'draft') AS status,
  tq.id AS source_content_id,
  tq.created_at,
  tq.updated_at,
  CASE
    WHEN LOWER(TRIM(tq.status)) = 'published' THEN tq.updated_at
    ELSE NULL
  END AS published_at,
  CASE
    WHEN LOWER(TRIM(tq.status)) = 'archived' THEN tq.updated_at
    ELSE NULL
  END AS archived_at
FROM public.trivia_questions tq
WHERE LOWER(TRIM(tq.question_type)) = 'who-am-i'
ORDER BY tq.created_at;

-- Verify migration
SELECT
  COUNT(*) as migrated_count,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
  COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_count
FROM public.trivia_who_am_i;

-- Show sample of migrated data
SELECT
  id,
  LEFT(question_text, 50) as question_preview,
  correct_answer,
  status,
  theme,
  source_content_id
FROM public.trivia_who_am_i
ORDER BY created_at DESC
LIMIT 5;

