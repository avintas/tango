-- One-time script to backfill titles for existing ingested content.
-- It generates a title from the first 10 words of the content_text.
UPDATE public.ingested
SET title = array_to_string((string_to_array(content_text, ' '))[1:10], ' ') || '...'
WHERE title IS NULL OR title = '';
