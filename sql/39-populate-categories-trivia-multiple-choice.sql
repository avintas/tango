-- Migration 39: Populate categories in trivia_multiple_choice table
-- Purpose: Assign categories to questions that currently have NULL category
-- Strategy: Multi-phase approach (Source Content → Pattern Matching → AI)
-- Date: 2024

-- =============================================================================
-- PHASE 0: VERIFICATION - Check current state
-- =============================================================================

-- Count records needing category assignment
-- SELECT 
--   COUNT(*) as total_records,
--   COUNT(CASE WHEN category IS NULL THEN 1 END) as null_categories,
--   COUNT(CASE WHEN category IS NOT NULL THEN 1 END) as has_categories,
--   COUNT(CASE WHEN source_content_id IS NOT NULL THEN 1 END) as has_source_content,
--   COUNT(CASE WHEN theme IS NOT NULL THEN 1 END) as has_theme
-- FROM public.trivia_multiple_choice;

-- =============================================================================
-- PHASE 1: SOURCE CONTENT INHERITANCE
-- =============================================================================
-- Inherit category from source_content_ingested table where available
-- This is the most reliable method since source content has AI-extracted categories

UPDATE public.trivia_multiple_choice tmc
SET category = sci.category
FROM public.source_content_ingested sci
WHERE tmc.source_content_id = sci.id
  AND tmc.category IS NULL
  AND sci.category IS NOT NULL
  AND sci.theme = tmc.theme; -- Ensure theme matches for validation

-- Verify Phase 1 results
-- SELECT 
--   'Phase 1 Complete' as phase,
--   COUNT(*) as records_updated
-- FROM public.trivia_multiple_choice
-- WHERE category IS NOT NULL;

-- =============================================================================
-- PHASE 2: PATTERN-BASED CATEGORY ASSIGNMENT
-- =============================================================================
-- Use tags and question_text patterns to infer categories
-- This handles cases where source_content_id is not available

-- Theme: "Players"
-- IMPORTANT: Process specific categories FIRST, then "Player Spotlight" as fallback
-- Order matters: More specific categories should be assigned before general ones

-- Category: "Sharpshooters" - Scoring/goals focused
UPDATE public.trivia_multiple_choice
SET category = 'Sharpshooters'
WHERE category IS NULL
  AND theme = 'Players'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('goal', 'scoring', 'shooter', 'points', 'goals', 'scorer', 'offense', 'scored', 'scoring', 'point'))
    )) OR
    question_text ~* '\b(goal|goals|scoring|points|scorer|shooter|scored|point|assist|assists)\b'
  );

-- Category: "Net Minders" - Goalie focused
UPDATE public.trivia_multiple_choice
SET category = 'Net Minders'
WHERE category IS NULL
  AND theme = 'Players'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('goalie', 'goalkeeper', 'save', 'shutout', 'goaltender', 'tender', 'goaltending'))
    )) OR
    question_text ~* '\b(goalie|goalkeeper|goaltender|tender|save|shutout|saves|goaltending|between the pipes)\b'
  );

-- Category: "Icons" - Legendary/hall of fame players
UPDATE public.trivia_multiple_choice
SET category = 'Icons'
WHERE category IS NULL
  AND theme = 'Players'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('legend', 'hall of fame', 'retired', 'career', 'icon', 'greatest', 'halloffame', 'hof'))
    )) OR
    question_text ~* '\b(legend|hall of fame|retired|icon|greatest|all-time|halloffame|hof|legacy)\b'
  );

-- Category: "Captains" - Leadership/captaincy
UPDATE public.trivia_multiple_choice
SET category = 'Captains'
WHERE category IS NULL
  AND theme = 'Players'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('captain', 'leadership', 'captaincy', 'c'))
    )) OR
    question_text ~* '\b(captain|leadership|captaincy|wore the C)\b'
  );

-- Category: "Hockey is Family" - Family connections
UPDATE public.trivia_multiple_choice
SET category = 'Hockey is Family'
WHERE category IS NULL
  AND theme = 'Players'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('family', 'sibling', 'brother', 'sister', 'father', 'son', 'daughter', 'brothers', 'sisters'))
    )) OR
    question_text ~* '\b(family|sibling|brother|sister|father|son|daughter|brothers|sisters|related)\b'
  );

-- Category: "Player Spotlight" - DEFAULT fallback for Players theme
-- Assign this LAST, after all specific categories have been processed
-- This catches any Players theme questions that didn't match more specific categories
UPDATE public.trivia_multiple_choice
SET category = 'Player Spotlight'
WHERE category IS NULL
  AND theme = 'Players';

-- Theme: "Teams & Organizations"
-- Category: "Stanley Cup Playoffs"
UPDATE public.trivia_multiple_choice
SET category = 'Stanley Cup Playoffs'
WHERE category IS NULL
  AND theme = 'Teams & Organizations'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('playoff', 'stanley cup', 'postseason', 'playoffs', 'cup', 'stanleycup'))
    )) OR
    question_text ~* '\b(playoff|playoffs|stanley cup|postseason|stanleycup|championship|championships)\b'
  );

-- Category: "NHL Draft"
UPDATE public.trivia_multiple_choice
SET category = 'NHL Draft'
WHERE category IS NULL
  AND theme = 'Teams & Organizations'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('draft', 'pick', 'prospect', 'rookie', 'drafted', 'draftpick', 'nhl draft'))
    )) OR
    question_text ~* '\b(draft|pick|prospect|rookie|drafted|draft pick|draftpick|nhl draft|first overall|second overall)\b'
  );

-- Category: "Free Agency"
UPDATE public.trivia_multiple_choice
SET category = 'Free Agency'
WHERE category IS NULL
  AND theme = 'Teams & Organizations'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('free agency', 'signing', 'contract', 'free agent', 'ufa', 'rfa', 'freeagency'))
    )) OR
    question_text ~* '\b(free agency|signing|contract|free agent|UFA|RFA|freeagency|signed|signs)\b'
  );

-- Category: "Game Day" - Default for Teams & Organizations if no other category matches
UPDATE public.trivia_multiple_choice
SET category = 'Game Day'
WHERE category IS NULL
  AND theme = 'Teams & Organizations'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('game', 'match', 'regular season', 'season', 'gameday'))
    )) OR
    question_text ~* '\b(game|match|regular season|season|gameday|regular season game)\b'
  );

-- Category: "Hockey Nations"
UPDATE public.trivia_multiple_choice
SET category = 'Hockey Nations'
WHERE category IS NULL
  AND theme = 'Teams & Organizations'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('international', 'world', 'country', 'nation', 'olympics', 'world cup', 'worldcup', 'iihf'))
    )) OR
    question_text ~* '\b(international|world|country|nation|olympics|world cup|worldcup|iihf|team canada|team usa|team russia)\b'
  );

-- Category: "All-Star Game"
UPDATE public.trivia_multiple_choice
SET category = 'All-Star Game'
WHERE category IS NULL
  AND theme = 'Teams & Organizations'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('all-star', 'all star', 'allstar', 'allstargame'))
    )) OR
    question_text ~* '\b(all-star|all star|allstar|allstargame|all star game)\b'
  );

-- Category: "Heritage Classic"
UPDATE public.trivia_multiple_choice
SET category = 'Heritage Classic'
WHERE category IS NULL
  AND theme = 'Teams & Organizations'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('heritage classic', 'outdoor', 'outdoor game', 'heritageclassic', 'winter classic'))
    )) OR
    question_text ~* '\b(heritage classic|outdoor game|outdoor|heritageclassic|winter classic)\b'
  );

-- Theme: "Awards & Honors"
-- Category: "NHL Awards"
UPDATE public.trivia_multiple_choice
SET category = 'NHL Awards'
WHERE category IS NULL
  AND theme = 'Awards & Honors'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('award', 'hart', 'norris', 'vezina', 'calder', 'selke', 'trophy', 'trophies', 'conn smythe', 'art ross'))
    )) OR
    question_text ~* '\b(award|hart|norris|vezina|calder|selke|trophy|trophies|conn smythe|art ross|richard|lady byng)\b'
  );

-- Category: "Milestones"
UPDATE public.trivia_multiple_choice
SET category = 'Milestones'
WHERE category IS NULL
  AND theme = 'Awards & Honors'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('milestone', 'record', 'achievement', 'first', '1000', '500'))
    )) OR
    question_text ~* '\b(milestone|record|achievement|first|1000|500|broke|set a record|all-time record)\b'
  );

-- Theme: "Leadership & Staff"
-- Category: "Coaching"
UPDATE public.trivia_multiple_choice
SET category = 'Coaching'
WHERE category IS NULL
  AND theme = 'Leadership & Staff'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('coach', 'coaching', 'head coach', 'assistant coach', 'bench'))
    )) OR
    question_text ~* '\b(coach|coaching|head coach|assistant coach|bench|behind the bench)\b'
  );

-- Category: "Management"
UPDATE public.trivia_multiple_choice
SET category = 'Management'
WHERE category IS NULL
  AND theme = 'Leadership & Staff'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('gm', 'general manager', 'management', 'gm'))
    )) OR
    question_text ~* '\b(general manager|GM|management|gm|executive)\b'
  );

-- Category: "Front Office"
UPDATE public.trivia_multiple_choice
SET category = 'Front Office'
WHERE category IS NULL
  AND theme = 'Leadership & Staff'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('front office', 'executive', 'president', 'owner', 'frontoffice'))
    )) OR
    question_text ~* '\b(front office|executive|president|owner|frontoffice|ownership)\b'
  );

-- Theme: "Venues & Locations"
-- Category: "Stadium Series"
UPDATE public.trivia_multiple_choice
SET category = 'Stadium Series'
WHERE category IS NULL
  AND theme = 'Venues & Locations'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('stadium series', 'stadium', 'outdoor', 'stadiumseries'))
    )) OR
    question_text ~* '\b(stadium series|stadium|outdoor|stadiumseries|winter classic)\b'
  );

-- Category: "Global Series"
UPDATE public.trivia_multiple_choice
SET category = 'Global Series'
WHERE category IS NULL
  AND theme = 'Venues & Locations'
  AND (
    (tags IS NOT NULL AND (
      EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) IN ('global series', 'international', 'overseas', 'globalseries'))
    )) OR
    question_text ~* '\b(global series|international|overseas|globalseries|played in|hosted in)\b'
  );

-- =============================================================================
-- PHASE 3: VERIFICATION & REPORTING
-- =============================================================================

-- Final verification query (uncomment to run)
-- SELECT 
--   theme,
--   category,
--   COUNT(*) as count
-- FROM public.trivia_multiple_choice
-- GROUP BY theme, category
-- ORDER BY theme, category;

-- Count remaining NULL categories by theme
-- SELECT 
--   theme,
--   COUNT(*) as null_category_count
-- FROM public.trivia_multiple_choice
-- WHERE category IS NULL
-- GROUP BY theme
-- ORDER BY null_category_count DESC;

-- =============================================================================
-- NOTES
-- =============================================================================
-- 
-- After running this migration:
-- 1. Review the verification queries to see how many categories were assigned
-- 2. For remaining NULL categories, consider:
--    a) Manual review and assignment
--    b) AI-powered batch assignment using Gemini API
--    c) Leaving as NULL if no category fits (categories are optional)
--
-- Categories are OPTIONAL - it's acceptable to have NULL categories.
-- Theme is REQUIRED and provides sufficient classification for most use cases.

