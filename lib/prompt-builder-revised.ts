/**
 * Revised prompt builder with question_type as primary driver
 */

export interface PromptSelections {
  game_type: string;
  question_type: string;
  topic: string;
  audience: string;
  number_of_questions: string;
  comparison_type: string; // Only for Comparison question_type
  answer_format: string; // Varies by question_type
  fact_quality_1: string;
  fact_quality_2: string;
  difficulty_level: string;
  output_format: string;
}

/**
 * Build the final prompt using revised structure
 */
export function buildPromptRevised(selections: PromptSelections): string {
  let prompt = '';

  // Core sentence
  if (selections.game_type && selections.topic && selections.audience) {
    prompt = `I am creating a ${selections.game_type} about ${selections.topic} for ${selections.audience}.`;
  }

  // Number of questions
  if (selections.number_of_questions) {
    prompt += ` Generate ${selections.number_of_questions} trivia questions.`;
  }

  // Question type style
  if (selections.question_type) {
    prompt += ` The questions should be ${selections.question_type} style.`;
  }

  // Comparison type (only if question_type is Comparison)
  if (selections.question_type === 'Comparison' && selections.comparison_type) {
    prompt += ` ${selections.comparison_type}.`;
  }

  // Fact qualities
  const qualities = [];
  if (selections.fact_quality_1) qualities.push(selections.fact_quality_1);
  if (selections.fact_quality_2) qualities.push(selections.fact_quality_2);
  if (qualities.length > 0) {
    prompt += ` Each question should be ${qualities.join(' and ')}.`;
  }

  // Answer format (if selected)
  if (selections.answer_format) {
    prompt += ` Provide ${selections.answer_format}.`;
  }

  // CRITICAL: Add trivia structure requirements
  if (selections.question_type === 'Multiple-Choice') {
    prompt += ` IMPORTANT: Each question must have exactly 4 options total (1 correct answer + 3 plausible wrong answers). Make the wrong answers realistic and believable, not obviously incorrect.`;
  }

  if (selections.question_type === 'True or False') {
    prompt += ` IMPORTANT: Format each question as a clear statement that can be definitively true or false.`;
  }

  // Hockey-specific context
  prompt += ` Focus on accurate hockey facts, statistics, history, players, teams, and rules. Ensure all information is factually correct and up-to-date.`;

  // Difficulty level
  if (selections.difficulty_level) {
    if (selections.difficulty_level === 'mixed difficulty') {
      prompt += ` Mix the difficulty levels appropriately for the audience.`;
    } else {
      prompt += ` Make all questions ${selections.difficulty_level} difficulty.`;
    }
  }

  // Content quality requirements
  prompt += ` Make the content engaging, educational, and appropriate for the specified audience.`;

  // Output format with specific structure requirements
  if (selections.output_format) {
    if (selections.output_format === 'a JSON object') {
      prompt += ` Format as a structured JSON object with clear fields for questions, answers, and metadata.`;
    } else if (selections.output_format === 'a Markdown document') {
      prompt += ` Format as a well-structured Markdown document ready for website publication.`;
    } else {
      prompt += ` Format the output as ${selections.output_format}.`;
    }
  }

  return prompt.trim();
}

/**
 * Get answer format options based on question_type
 */
export function getAnswerFormatOptions(
  questionType: string,
  variables: Record<string, string[]>
) {
  switch (questionType) {
    case 'Fact-based':
      return variables.answer_format_fact_based || [];
    case 'Multiple-Choice':
      return variables.answer_format_multiple_choice || [];
    case 'Clue-based':
      return variables.answer_format_clue_based || [];
    case 'Comparison':
    case 'True or False':
      // These types might not need answer format options
      return [];
    default:
      return [];
  }
}

/**
 * Check if comparison_type should be shown
 */
export function shouldShowComparisonType(questionType: string): boolean {
  return questionType === 'Comparison';
}

/**
 * Check if answer_format should be shown
 */
export function shouldShowAnswerFormat(questionType: string): boolean {
  return ['Fact-based', 'Multiple-Choice', 'Clue-based'].includes(questionType);
}

/**
 * Get default selections for revised structure
 */
export function getDefaultSelectionsRevised(
  variables: Record<string, string[]>
) {
  return {
    game_type: variables.game_type?.[0] || '',
    question_type: variables.question_type?.[0] || '',
    topic: variables.topic?.[0] || '',
    audience: variables.audience?.[0] || '',
    number_of_questions: variables.number_of_questions?.[0] || '10',
    comparison_type: '',
    answer_format: '',
    fact_quality_1: '',
    fact_quality_2: '',
    difficulty_level: variables.difficulty_level?.[0] || '',
    output_format: variables.output_format?.[0] || '',
  };
}
