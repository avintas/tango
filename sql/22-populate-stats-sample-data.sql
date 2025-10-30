-- Sample hockey statistics for testing
-- Insert sample stats into the collection_stats table

INSERT INTO public.collection_stats (
  stat_text,
  stat_value,
  stat_category,
  year,
  theme,
  category,
  attribution,
  status,
  published_at
) VALUES
  -- Player Stats
  (
    'Wayne Gretzky scored 894 goals in his NHL career',
    '894 goals',
    'player',
    1999,
    'scoring',
    'career',
    'NHL Official Stats',
    'published',
    NOW()
  ),
  (
    'Connor McDavid reached 1000 career points in just 659 games',
    '1000 points in 659 games',
    'player',
    2023,
    'milestones',
    'NHL',
    'NHL.com',
    'published',
    NOW()
  ),
  (
    'Alex Ovechkin has scored 800+ career goals',
    '800+ goals',
    'player',
    2023,
    'scoring',
    'career',
    'NHL.com',
    'published',
    NOW()
  ),
  (
    'Martin Brodeur holds the record for most wins by a goaltender with 691',
    '691 wins',
    'player',
    2015,
    'records',
    'goaltending',
    'Hockey Reference',
    'published',
    NOW()
  ),
  
  -- Team Stats
  (
    'The Montreal Canadiens have won 24 Stanley Cups',
    '24 Stanley Cups',
    'team',
    NULL,
    'championships',
    'historical',
    'NHL.com',
    'published',
    NOW()
  ),
  (
    'The Edmonton Oilers scored 446 goals in the 1983-84 season',
    '446 goals',
    'team',
    1984,
    'scoring',
    'season',
    'Hockey Reference',
    'published',
    NOW()
  ),
  (
    'The 1976-77 Montreal Canadiens lost only 8 games all season',
    '8 losses',
    'team',
    1977,
    'records',
    'season',
    'NHL Official Stats',
    'published',
    NOW()
  ),
  
  -- League Stats
  (
    'The NHL expanded to 32 teams with the addition of Seattle Kraken',
    '32 teams',
    'league',
    2021,
    'expansion',
    'NHL',
    'NHL.com',
    'published',
    NOW()
  ),
  (
    'The Original Six era lasted from 1942 to 1967',
    '6 teams for 25 years',
    'league',
    1967,
    'history',
    'historical',
    'Hockey Reference',
    'published',
    NOW()
  ),
  
  -- Historical Stats
  (
    'The fastest goal in NHL history was scored 5 seconds into a game',
    '5 seconds',
    'historical',
    2022,
    'records',
    'speed',
    'NHL Records',
    'published',
    NOW()
  ),
  (
    'Bobby Orr won the Norris Trophy 8 consecutive times',
    '8 consecutive Norris Trophies',
    'historical',
    1975,
    'awards',
    'defense',
    'Hockey Hall of Fame',
    'published',
    NOW()
  ),
  
  -- Modern Stats (2023-2024)
  (
    'Nathan MacKinnon led the NHL with 140 points in 2023-24',
    '140 points',
    'player',
    2024,
    'scoring',
    'season',
    'NHL.com',
    'published',
    NOW()
  ),
  (
    'The average NHL game features 6 goals scored',
    '6 goals per game',
    'league',
    2024,
    'scoring',
    'average',
    'NHL Stats',
    'published',
    NOW()
  ),
  
  -- Draft Examples (for variety)
  (
    'Sidney Crosby was selected first overall in the 2005 NHL Draft',
    '1st overall',
    'player',
    2005,
    'draft',
    'historical',
    'NHL Draft Records',
    'draft',
    NULL
  ),
  (
    'The shortest overtime in Stanley Cup Final history was 9 seconds',
    '9 seconds',
    'historical',
    2010,
    'playoffs',
    'records',
    'NHL Playoff Records',
    'draft',
    NULL
  );

-- Verify the insert
SELECT 
  COUNT(*) as total_stats,
  COUNT(*) FILTER (WHERE status = 'published') as published,
  COUNT(*) FILTER (WHERE status = 'draft') as draft,
  COUNT(DISTINCT stat_category) as categories
FROM collection_stats;

