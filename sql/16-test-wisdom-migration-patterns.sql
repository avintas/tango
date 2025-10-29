-- Test regex patterns for wisdom migration
-- Shows original data and transformed results side-by-side
-- Run this BEFORE the actual migration to verify extraction logic

SELECT 
  id,
  content_type,
  status,
  
  -- Show original content_text (truncated for readability)
  LEFT(content_text, 100) || '...' AS original_content_preview,
  
  -- Test: Extract clean title
  TRIM(
    REGEXP_REPLACE(
      SUBSTRING(content_text FROM 'Title: (.*?)\n\n'),
      '\n.*$',
      ''
    )
  ) AS extracted_title,
  
  -- Test: Extract musing text
  TRIM(
    SUBSTRING(content_text FROM 'The Musing: (.*?)\n\nFrom the Box:')
  ) AS extracted_musing,
  
  -- Test: Extract from_the_box and strip quotes
  TRIM(
    BOTH '"' FROM
    TRIM(
      SUBSTRING(content_text FROM 'From the Box: (.*)$')
    )
  ) AS extracted_from_the_box,
  
  -- Show what the fields look like currently (for comparison)
  LEFT(content_title, 50) AS current_content_title,
  LEFT(musings, 100) || '...' AS current_musings,
  LEFT(from_the_box, 100) AS current_from_the_box

FROM public.content
WHERE content_type = 'wisdom'
ORDER BY id
LIMIT 5;

-- Summary: Check for any NULL results (indicates pattern failure)
SELECT
  COUNT(*) as total_wisdom_entries,
  COUNT(CASE 
    WHEN TRIM(REGEXP_REPLACE(SUBSTRING(content_text FROM 'Title: (.*?)\n\n'), '\n.*$', '')) IS NULL 
    THEN 1 
  END) as null_titles,
  COUNT(CASE 
    WHEN TRIM(SUBSTRING(content_text FROM 'The Musing: (.*?)\n\nFrom the Box:')) IS NULL 
    THEN 1 
  END) as null_musings,
  COUNT(CASE 
    WHEN TRIM(BOTH '"' FROM TRIM(SUBSTRING(content_text FROM 'From the Box: (.*)$'))) IS NULL 
    THEN 1 
  END) as null_from_the_box
FROM public.content
WHERE content_type = 'wisdom';

