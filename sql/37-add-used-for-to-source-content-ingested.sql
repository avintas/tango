-- Migration 37: Add used_for field to source_content_ingested table
-- Purpose: Track which content types have been created from this source content
-- Similar to the old 'ingested' table's used_for field

-- Add used_for column (array of strings)
ALTER TABLE public.source_content_ingested
ADD COLUMN IF NOT EXISTS used_for TEXT[] DEFAULT '{}';

-- Create index for array operations
CREATE INDEX IF NOT EXISTS idx_source_content_used_for ON public.source_content_ingested USING GIN (used_for);

-- Create or replace RPC function to append to used_for array
-- This function works with source_content_ingested table
CREATE OR REPLACE FUNCTION public.append_to_used_for(
  target_id BIGINT,
  usage_type TEXT
)
RETURNS VOID AS $$
DECLARE
  normalized_type TEXT;
BEGIN
  -- Normalize usage type to match badge config keys
  -- Map content types to badge keys
  normalized_type := CASE
    WHEN usage_type IN ('multiple-choice', 'mc') THEN 'multiple-choice'
    WHEN usage_type IN ('true-false', 'tf') THEN 'true-false'
    WHEN usage_type IN ('who-am-i', 'whoami', 'wai') THEN 'who-am-i'
    WHEN usage_type IN ('stat', 'statistics') THEN 'stat'
    WHEN usage_type = 'motivational' THEN 'motivational'
    WHEN usage_type IN ('greeting', 'greetings') THEN 'greeting'
    WHEN usage_type IN ('wisdom', 'pbp') THEN 'wisdom'
    ELSE usage_type
  END;

  -- Update the used_for array, avoiding duplicates
  UPDATE public.source_content_ingested
  SET used_for = (
    SELECT array_agg(DISTINCT elem)
    FROM (
      SELECT unnest(COALESCE(used_for, '{}'::TEXT[]) || ARRAY[normalized_type]) AS elem
    ) AS distinct_elems
  )
  WHERE id = target_id
    AND NOT (normalized_type = ANY(COALESCE(used_for, '{}'::TEXT[])));
END;
$$ LANGUAGE plpgsql;

