-- REVISED MIGRATION SCRIPT (v3 - Multi-step)
-- This version breaks the migration into multiple steps to isolate any potential issues.

-- Step 1: Insert the core data.
-- We are only inserting the data that comes directly from the source table.
INSERT INTO public.trivia_true_false (
  question_text,
  is_true,
  explanation,
  theme,
  tags,
  status,
  source_content_id,
  created_at,
  updated_at
)
SELECT
  tq.question_text,
  LOWER(TRIM(tq.correct_answer)) = 'true' AS is_true,
  tq.explanation,
  tq.theme,
  tq.tags,
  tq.status,
  tq.id AS source_content_id,
  tq.created_at,
  tq.updated_at
FROM
  public.trivia_questions tq
WHERE
  LOWER(TRIM(tq.question_type)) = 'true-false';

-- Step 2: Update the 'published_at' timestamp for published items.
-- This separates the timestamp logic from the main data insertion.
UPDATE public.trivia_true_false tft
SET published_at = tq.updated_at
FROM public.trivia_questions tq
WHERE
  tft.source_content_id = tq.id
  AND LOWER(TRIM(tq.status)) = 'published';

-- Step 3: Update the 'archived_at' timestamp for archived items.
UPDATE public.trivia_true_false tft
SET archived_at = tq.updated_at
FROM public.trivia_questions tq
WHERE
  tft.source_content_id = tq.id
  AND LOWER(TRIM(tq.status)) = 'archived';
