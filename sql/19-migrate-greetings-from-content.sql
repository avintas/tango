-- Migrate greetings data from content table to dedicated collection_greetings table
-- Moves all greeting content (content_type = 'greeting') to the new table

INSERT INTO public.collection_greetings (
  greeting_text,
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
  -- Map content_text to greeting_text
  content_text AS greeting_text,
  
  -- Direct field copies
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
WHERE content_type = 'greeting'
ORDER BY id;

-- Show migration results
SELECT 
  COUNT(*) as total_migrated,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
  COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_count,
  COUNT(CASE WHEN status IS NULL OR status NOT IN ('published', 'archived') THEN 1 END) as other_count
FROM public.collection_greetings;

