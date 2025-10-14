/**
 * Sample trivia data for UI testing
 */

export const sampleTriviaSet = {
  id: 1,
  title: 'Daily Quiz - NHL Records',
  content_type: 'trivia',
  category: 'daily-quiz',
  status: 'published' as const,
  published_at: '2025-10-14T08:00:00Z',
  created_at: '2025-10-13T10:30:00Z',
  updated_at: '2025-10-13T10:30:00Z',
  markdown_content: JSON.stringify([
    {
      question:
        "What is Wayne Gretzky's career total for regular season points?",
      correct_answer: '2,857 points',
      incorrect_answers: ['1,850 points', '2,212 points', '3,014 points'],
      category: 'NHL Records',
      explanation:
        'Wayne Gretzky accumulated an astonishing **2,857 career points** in regular season play (**894 goals** and **1,963 assists**).',
    },
    {
      question: 'Which goalie holds the record for most career wins?',
      correct_answer: 'Martin Brodeur',
      incorrect_answers: ['Patrick Roy', 'Marc-Andre Fleury', 'Roberto Luongo'],
      category: 'Goaltenders',
      explanation:
        '**Martin Brodeur** holds the NHL record with **691 career wins**, achieved over 22 seasons with the New Jersey Devils.',
    },
    {
      question: 'How many consecutive games did Doug Jarvis play?',
      correct_answer: '964 games',
      incorrect_answers: ['802 games', '1,029 games', '745 games'],
      category: 'Iron Man Records',
      explanation:
        'Doug Jarvis holds the **NHL ironman record** with **964 consecutive games** played from 1975 to 1987.',
    },
  ]),
};

export const sampleHalloweenTrivia = {
  id: 2,
  title: 'Halloween Special - Spooky Stats',
  content_type: 'trivia',
  category: 'halloween',
  status: 'published' as const,
  published_at: '2025-10-31T08:00:00Z',
  created_at: '2025-10-13T14:20:00Z',
  updated_at: '2025-10-13T14:20:00Z',
  markdown_content: JSON.stringify([
    {
      question: "Which team is nicknamed 'The Ghosts'?",
      correct_answer: 'Winnipeg Jets (original)',
      incorrect_answers: [
        'Colorado Avalanche',
        'Carolina Hurricanes',
        'Arizona Coyotes',
      ],
      category: 'Team Nicknames',
      explanation:
        'The original **Winnipeg Jets** were sometimes called the "White Out Ghosts" due to their all-white playoff tradition.',
    },
  ]),
};

export const sampleMotivational = {
  id: 3,
  title: 'Monday Motivation - Comeback Stories',
  content_type: 'motivational',
  category: 'monday-motivation',
  status: 'published' as const,
  published_at: '2025-10-14T06:00:00Z',
  created_at: '2025-10-13T16:00:00Z',
  updated_at: '2025-10-13T16:00:00Z',
  markdown_content:
    "Even a setback can be a setup for a comeback. A new opportunity, a new role, or just a shift in perspective can unlock potential you didn't know you had. Like Robby Fabbri and Noel Acciari, who exceeded all expectations, or William Nylander, who found his stride with a new coach, your rebirth could be just around the corner. Stay resilient, stay focused, and you might surprise everyone—including yourself.",
};

export const sampleStats = {
  id: 4,
  title: 'Playoff Stats - 2025 Edition',
  content_type: 'stats',
  category: 'playoffs',
  status: 'draft' as const,
  published_at: null,
  created_at: '2025-10-14T09:15:00Z',
  updated_at: '2025-10-14T09:15:00Z',
  markdown_content: JSON.stringify([
    {
      statistic: 'Most goals in a single playoff run',
      value: '19 goals',
      context:
        'Reggie Leach scored 19 goals for the Philadelphia Flyers in the 1976 playoffs',
      category: 'Playoff Records',
    },
    {
      statistic: 'Fastest goal from start of a playoff game',
      value: '6 seconds',
      context:
        'Don Kozak scored just 6 seconds into a playoff game on April 17, 1977',
      category: 'Playoff Records',
    },
  ]),
};

export const allSampleContent = [
  sampleTriviaSet,
  sampleHalloweenTrivia,
  sampleMotivational,
  sampleStats,
];
