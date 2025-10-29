-- ============================================
-- Wisdom Content Theme Standardization
-- ============================================

-- Map all existing themes to the 5 standardized themes
UPDATE content
SET theme = CASE
    -- PLAYERS (individual qualities: resilience, potential, sacrifice)
    WHEN theme IN (
        'resilience',
        'potential',
        'desire',
        'sacrifice',
        'perspective',
        'renewal',
        'change'
    ) THEN 'Players'
    
    -- TEAMS & ORGANIZATIONS (team/collective concepts: belonging, connections)
    WHEN theme IN (
        'belonging',
        'connections',
        'rivalry',
        'destiny',
        'urgency'
    ) THEN 'Teams & Organizations'
    
    -- AWARDS & HONORS (achievement, legacy, impact)
    WHEN theme IN (
        'legacy',
        'impact',
        'expectation',
        'respect'
    ) THEN 'Awards & Honors'
    
    -- LEADERSHIP & STAFF (leadership, responsibility)
    WHEN theme IN (
        'leadership',
        'responsibility'
    ) THEN 'Leadership & Staff'
    
    ELSE theme  -- Safety: keep any unmapped themes as-is
END
WHERE content_type = 'wisdom';

-- Verification: Show new theme distribution
SELECT theme, COUNT(*) as count
FROM content
WHERE content_type = 'wisdom'
GROUP BY theme
ORDER BY count DESC;

