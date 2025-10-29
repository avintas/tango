-- ============================================
-- Greeting Content Theme Assignment
-- ============================================

-- Greetings currently have NO themes (all NULL)
-- We'll assign a default theme distribution based on content

-- STRATEGY: Assign themes in round-robin fashion to ensure variety
-- This creates a balanced distribution across all 5 themes

WITH numbered_greetings AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY id) as row_num
  FROM content
  WHERE content_type = 'greeting' AND theme IS NULL
)
UPDATE content
SET theme = CASE 
    WHEN (SELECT row_num FROM numbered_greetings WHERE numbered_greetings.id = content.id) % 5 = 1 THEN 'Players'
    WHEN (SELECT row_num FROM numbered_greetings WHERE numbered_greetings.id = content.id) % 5 = 2 THEN 'Teams & Organizations'
    WHEN (SELECT row_num FROM numbered_greetings WHERE numbered_greetings.id = content.id) % 5 = 3 THEN 'Venues & Locations'
    WHEN (SELECT row_num FROM numbered_greetings WHERE numbered_greetings.id = content.id) % 5 = 4 THEN 'Awards & Honors'
    WHEN (SELECT row_num FROM numbered_greetings WHERE numbered_greetings.id = content.id) % 5 = 0 THEN 'Leadership & Staff'
END
WHERE content_type = 'greeting' AND theme IS NULL;

-- Verification: Show new theme distribution
SELECT theme, COUNT(*) as count
FROM content
WHERE content_type = 'greeting'
GROUP BY theme
ORDER BY count DESC;

