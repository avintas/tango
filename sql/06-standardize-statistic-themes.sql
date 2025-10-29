-- ============================================
-- Statistic Content Theme Standardization
-- ============================================

-- Map all existing themes to the 5 standardized themes
UPDATE content
SET theme = CASE
    -- PLAYERS (individual player achievements/stats)
    WHEN theme IN (
        'scoring',
        'goaltending',
        'defense',
        'performance'
    ) THEN 'Players'
    
    -- TEAMS & ORGANIZATIONS (team/franchise/organizational content)
    WHEN theme IN (
        'community',
        'franchise',
        'team',
        'championships',
        'comeback',
        'contracts'
    ) THEN 'Teams & Organizations'
    
    -- VENUES & LOCATIONS (schedule/location content)
    WHEN theme IN (
        'schedule'
    ) THEN 'Venues & Locations'
    
    -- AWARDS & HONORS (awards/achievements)
    WHEN theme IN (
        'awards',
        'history'
    ) THEN 'Awards & Honors'
    
    -- LEADERSHIP & STAFF (leadership/management)
    WHEN theme IN (
        'leadership'
    ) THEN 'Leadership & Staff'
    
    ELSE theme  -- Safety: keep any unmapped themes as-is
END
WHERE content_type = 'statistic';

-- Verification: Show new theme distribution
SELECT theme, COUNT(*) as count
FROM content
WHERE content_type = 'statistic'
GROUP BY theme
ORDER BY count DESC;

