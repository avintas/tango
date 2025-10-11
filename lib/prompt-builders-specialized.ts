/**
 * Specialized prompt builders for different content types
 */

export interface TriviaSelections {
  game_type: string;
  question_type: string;
  topic: string;
  audience: string;
  number_of_questions: string;
  comparison_type: string;
  answer_format: string;
  fact_quality_1: string;
  fact_quality_2: string;
  difficulty_level: string;
  output_format: string;
}

export interface StatsSelections {
  content_type: string;
  data_focus: string;
  time_period: string;
  statistical_category: string;
  data_depth: string;
  audience_level: string;
  output_format: string;
  presentation_style: string;
  data_source: string;
}

export interface StoriesSelections {
  story_type: string;
  narrative_focus: string;
  story_length: string;
  perspective: string;
  emotional_tone: string;
  time_period: string;
  story_category: string;
  audience: string;
  output_format: string;
  storytelling_style: string;
}

export interface HugsSelections {
  content_focus: string;
  emotional_theme: string;
  story_type: string;
  content_length: string;
  perspective: string;
  impact_scope: string;
  content_category: string;
  audience: string;
  output_format: string;
  storytelling_style: string;
}

export interface MotivationalSelections {
  motivation_type: string;
  content_focus: string;
  motivational_theme: string;
  content_length: string;
  audience_level: string;
  inspiration_source: string;
  content_category: string;
  emotional_tone: string;
  output_format: string;
  presentation_style: string;
}

/**
 * Build fused prompt for trivia content
 */
export function buildTriviaPrompt(selections: TriviaSelections): string {
  let prompt = `I want you to create a hockey trivia game. The game should be a ${selections.game_type || 'trivia game'} about ${selections.topic || 'hockey'} for ${selections.audience || 'hockey fans'}.`;

  if (selections.number_of_questions) {
    prompt += ` Generate ${selections.number_of_questions} trivia questions.`;
  }

  if (selections.question_type) {
    prompt += ` The questions should be ${selections.question_type} style.`;
  }

  if (selections.question_type === 'Comparison' && selections.comparison_type) {
    prompt += ` Each comparison should be ${selections.comparison_type}.`;
  }

  if (selections.answer_format) {
    prompt += ` Provide ${selections.answer_format}.`;
  }

  // Quality requirements
  const qualities = [];
  if (selections.fact_quality_1) qualities.push(selections.fact_quality_1);
  if (selections.fact_quality_2) qualities.push(selections.fact_quality_2);
  if (qualities.length > 0) {
    prompt += ` Each question should be ${qualities.join(' and ')}.`;
  }

  if (selections.difficulty_level) {
    if (selections.difficulty_level === 'mixed difficulty') {
      prompt += ` Mix the difficulty levels appropriately for the audience.`;
    } else {
      prompt += ` Make all questions ${selections.difficulty_level} difficulty.`;
    }
  }

  // Trivia-specific requirements
  if (selections.question_type === 'Multiple-Choice') {
    prompt += ` IMPORTANT: Each question must have exactly 4 options total (1 correct answer + 3 plausible wrong answers). Make the wrong answers realistic and believable, not obviously incorrect.`;
  }

  if (selections.question_type === 'True or False') {
    prompt += ` IMPORTANT: Format each question as a clear statement that can be definitively true or false.`;
  }

  if (selections.output_format) {
    prompt += ` Format the output as ${selections.output_format}.`;
  }

  prompt += ` Focus on accurate hockey facts, statistics, history, players, teams, and rules. Ensure all information is factually correct and up-to-date.`;

  return prompt.trim();
}

/**
 * Build fused prompt for statistics content
 */
export function buildStatsPrompt(selections: StatsSelections): string {
  let prompt = `I want you to create hockey statistics content. The content should be a ${selections.content_type || 'statistical analysis'} that focuses on ${selections.data_focus || 'hockey data'}.`;

  if (selections.time_period) {
    prompt += ` The data should cover ${selections.time_period}.`;
  }

  if (selections.statistical_category) {
    prompt += ` Focus on ${selections.statistical_category}.`;
  }

  if (selections.data_depth) {
    prompt += ` Provide ${selections.data_depth}.`;
  }

  if (selections.audience_level) {
    prompt += ` The content should be appropriate for ${selections.audience_level}.`;
  }

  if (selections.presentation_style) {
    prompt += ` Present it in a ${selections.presentation_style} style.`;
  }

  if (selections.data_source) {
    prompt += ` Use ${selections.data_source} as the primary data source.`;
  }

  if (selections.output_format) {
    prompt += ` Format the output as ${selections.output_format}.`;
  }

  prompt += ` Ensure ALL hockey statistics are 100% accurate and factually correct. Use current, up-to-date data and numbers. Include proper context and time periods for all statistics.`;

  return prompt.trim();
}

/**
 * Build fused prompt for stories content
 */
export function buildStoriesPrompt(selections: StoriesSelections): string {
  let prompt = `I want you to write a hockey story. The story should be a ${selections.story_type || 'hockey story'} that focuses on ${selections.narrative_focus || 'hockey moments'}.`;

  if (selections.story_length) {
    prompt += ` The length should be ${selections.story_length}.`;
  }

  if (selections.perspective) {
    prompt += ` Tell it from a ${selections.perspective}.`;
  }

  if (selections.emotional_tone) {
    prompt += ` The emotional tone should be ${selections.emotional_tone}.`;
  }

  if (selections.time_period) {
    prompt += ` The story should take place during ${selections.time_period}.`;
  }

  if (selections.story_category) {
    prompt += ` The content falls under the ${selections.story_category} category.`;
  }

  if (selections.audience) {
    prompt += ` The story is for ${selections.audience}.`;
  }

  if (selections.storytelling_style) {
    prompt += ` Please write it in a ${selections.storytelling_style} style.`;
  }

  if (selections.output_format) {
    prompt += ` Format the output as ${selections.output_format}.`;
  }

  prompt += ` Focus on memorable hockey moments, legendary players, historic games, team rivalries. Create emotional connections with readers. Include specific details: dates, scores, player names, locations.`;

  return prompt.trim();
}

/**
 * Build fused prompt for HUGs content
 */
export function buildHugsPrompt(selections: HugsSelections): string {
  let prompt = `I want you to create heartwarming hockey content. The content should focus on ${selections.content_focus || 'positive hockey moments'} with an ${selections.emotional_theme || 'uplifting'} theme.`;

  if (selections.story_type) {
    prompt += ` Create ${selections.story_type}.`;
  }

  if (selections.content_length) {
    prompt += ` The content should be ${selections.content_length}.`;
  }

  if (selections.perspective) {
    prompt += ` Tell it from a ${selections.perspective}.`;
  }

  if (selections.impact_scope) {
    prompt += ` Focus on ${selections.impact_scope}.`;
  }

  if (selections.content_category) {
    prompt += ` The content falls under ${selections.content_category}.`;
  }

  if (selections.audience) {
    prompt += ` The content is for ${selections.audience}.`;
  }

  if (selections.storytelling_style) {
    prompt += ` Use a ${selections.storytelling_style} storytelling style.`;
  }

  if (selections.output_format) {
    prompt += ` Format the output as ${selections.output_format}.`;
  }

  prompt += ` Highlight acts of kindness, sportsmanship, community, and human connection. Emphasize the positive impact hockey has on people's lives. Use warm, compassionate, and uplifting language.`;

  return prompt.trim();
}

/**
 * Build fused prompt for motivational content
 */
export function buildMotivationalPrompt(
  selections: MotivationalSelections
): string {
  let prompt = `I want you to create motivational hockey content. The content should focus on ${selections.motivation_type || 'inspirational hockey moments'} with a theme of ${selections.motivational_theme || 'determination'}.`;

  if (selections.content_focus) {
    prompt += ` Focus on ${selections.content_focus}.`;
  }

  if (selections.content_length) {
    prompt += ` The content should be ${selections.content_length}.`;
  }

  if (selections.audience_level) {
    prompt += ` The content should be appropriate for ${selections.audience_level}.`;
  }

  if (selections.inspiration_source) {
    prompt += ` Draw inspiration from ${selections.inspiration_source}.`;
  }

  if (selections.content_category) {
    prompt += ` The content falls under ${selections.content_category}.`;
  }

  if (selections.emotional_tone) {
    prompt += ` Use an ${selections.emotional_tone} emotional tone.`;
  }

  if (selections.presentation_style) {
    prompt += ` Present it in a ${selections.presentation_style} style.`;
  }

  if (selections.output_format) {
    prompt += ` Format the output as ${selections.output_format}.`;
  }

  prompt += ` Focus on overcoming adversity, achieving goals, teamwork, dedication, and resilience. Use powerful, action-oriented language that motivates readers. Include specific examples of overcoming challenges and achieving success.`;

  return prompt.trim();
}
