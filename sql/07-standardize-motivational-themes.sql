-- ============================================
-- Motivational Content Theme Standardization
-- ============================================

-- Map all existing themes to the 5 standardized themes
UPDATE content
SET theme = CASE
    -- PLAYERS (individual growth, personal development)
    WHEN theme IN (
        'Personal Growth',
        'Individual Growth Beyond the Team',
        'Overcoming Adversity',
        'Work Ethic',
        'Dedication',
        'Focused Effort',
        'Continuous Improvement',
        'Preparation and Readiness',
        'Seizing Opportunity',
        'Embracing new opportunities',
        'Embracing the Challenge',
        'Finding Joy in the Grind',
        'Turning the Past into Fuel'
    ) THEN 'Players'
    
    -- TEAMS & ORGANIZATIONS (team unity, collective effort)
    WHEN theme IN (
        'Team First',
        'Commitment to Winning',
        'Prioritizing Victory',
        'Infectious Enthusiasm',
        'Lasting Connections',
        'gratitude',
        'positivity'
    ) THEN 'Teams & Organizations'
    
    -- AWARDS & HONORS (legacy, achievement)
    WHEN theme IN (
        'Legacy'
    ) THEN 'Awards & Honors'
    
    -- LEADERSHIP & STAFF (leadership, mentorship, community)
    WHEN theme IN (
        'Inspiring Leadership',
        'Leadership by Example',
        'Mentorship',
        'giving back',
        'impact beyond the game'
    ) THEN 'Leadership & Staff'
    
    ELSE theme  -- Safety: keep any unmapped themes as-is
END
WHERE content_type = 'motivational';

-- Verification: Show new theme distribution
SELECT theme, COUNT(*) as count
FROM content
WHERE content_type = 'motivational'
GROUP BY theme
ORDER BY count DESC;

