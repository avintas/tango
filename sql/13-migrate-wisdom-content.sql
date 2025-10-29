-- Migration script to parse existing wisdom content
-- Splits content_text into musings and from_the_box
-- Generates content_title from first 6 words (excluding "Title:")

-- This will parse wisdom content that follows the pattern:
-- "[quote/musing text] from the box: [commentary]"

UPDATE content
SET 
  musings = TRIM(REGEXP_REPLACE(content_text, '(.+?)\s*from the box:\s*.+', '\1', 'i')),
  from_the_box = TRIM(REGEXP_REPLACE(content_text, '.+?\s*from the box:\s*(.+)', '\1', 'i'))
WHERE 
  content_type = 'wisdom'
  AND content_text IS NOT NULL
  AND content_text ILIKE '%from the box:%'
  AND (musings IS NULL OR from_the_box IS NULL);

-- For wisdom items that don't match the pattern, put everything in musings
UPDATE content
SET musings = TRIM(content_text)
WHERE 
  content_type = 'wisdom'
  AND content_text IS NOT NULL
  AND content_text NOT ILIKE '%from the box:%'
  AND musings IS NULL;

-- Generate content_title from first 6 words of content_text (excluding "Title:")
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
  content_type = 'wisdom'
  AND content_text IS NOT NULL
  AND content_title IS NULL;

-- Verify migration
SELECT 
  id,
  content_type,
  LEFT(content_text, 50) as original,
  LEFT(musings, 30) as parsed_musings,
  LEFT(from_the_box, 30) as parsed_from_box
FROM content
WHERE content_type = 'wisdom'
LIMIT 10;

