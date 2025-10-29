-- Migrate wisdom data from content table to dedicated wisdom table
-- Extracts clean data from structured content_text field
-- Removes embedded labels and formatting artifacts

INSERT INTO public.wisdom (
  title,
  musing,
  from_the_box,
  theme,
  category,
  attribution,
  status,
  source_content_id,
  used_in,
  display_order,
  created_at,
  updated_at,
  published_at,
  archived_at
)
SELECT
  -- Extract clean title from content_text (between "Title: " and first "\n\n")
  TRIM(
    REGEXP_REPLACE(
      SUBSTRING(content_text FROM 'Title: (.*?)\n\n'),
      '\n.*$',
      ''
    )
  ) AS title,
  
  -- Extract musing text (between "The Musing: " and "\n\nFrom the Box:")
  TRIM(
    SUBSTRING(content_text FROM 'The Musing: (.*?)\n\nFrom the Box:')
  ) AS musing,
  
  -- Extract from_the_box and strip surrounding quotes
  TRIM(
    BOTH '"' FROM
    TRIM(
      SUBSTRING(content_text FROM 'From the Box: (.*)$')
    )
  ) AS from_the_box,
  
  -- Direct field copies
  theme,
  category,
  attribution,
  status,
  source_content_id,
  used_in,
  
  -- Use old content.id for display ordering
  id AS display_order,
  
  -- Timestamps
  created_at,
  updated_at,
  
  -- Set published_at to created_at for published items
  CASE 
    WHEN status = 'published' THEN created_at
    ELSE NULL
  END AS published_at,
  
  -- Set archived_at to updated_at for archived items
  CASE 
    WHEN status = 'archived' THEN updated_at
    ELSE NULL
  END AS archived_at

FROM public.content
WHERE content_type = 'wisdom'
ORDER BY id;

-- Show migration results
SELECT 
  COUNT(*) as total_migrated,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
  COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_count,
  COUNT(CASE WHEN status NOT IN ('published', 'archived') THEN 1 END) as other_count
FROM public.wisdom;

