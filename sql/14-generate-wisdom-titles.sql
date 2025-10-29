-- Generate content_title for ALL content types
-- Takes first 6 words from content_text (excluding "Title:" prefix)

UPDATE content
SET content_title = (
  SELECT STRING_AGG(word, ' ')
  FROM (
    SELECT unnest(
      string_to_array(
        TRIM(REGEXP_REPLACE(content_text, '^Title:\s*', '', 'i')),
        ' '
      )
    ) AS word
    LIMIT 6
  ) AS words
)
WHERE 
  content_text IS NOT NULL
  AND content_title IS NULL;

-- Verify title generation by content type
SELECT 
  content_type,
  COUNT(*) as items_with_titles
FROM content
WHERE content_title IS NOT NULL
GROUP BY content_type
ORDER BY content_type;

-- Show sample results
SELECT 
  id,
  content_type,
  LEFT(content_text, 50) as original_text,
  content_title
FROM content
WHERE content_title IS NOT NULL
ORDER BY id DESC
LIMIT 20;

