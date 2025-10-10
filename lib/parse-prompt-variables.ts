/**
 * Parse the prompt-variables.md file into a structured object
 */
export function parsePromptVariables(
  markdown: string
): Record<string, string[]> {
  const variables: Record<string, string[]> = {};

  const lines = markdown.split('\n');
  let currentCategory = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Match category headers: ## category_name
    if (trimmedLine.startsWith('## ')) {
      currentCategory = trimmedLine.replace('## ', '').trim();
      variables[currentCategory] = [];
    }
    // Match options: - Option text
    else if (trimmedLine.startsWith('- ') && currentCategory) {
      const option = trimmedLine.replace('- ', '').trim();
      if (option) {
        // Only add non-empty options
        variables[currentCategory].push(option);
      }
    }
  }

  return variables;
}

/**
 * Build the final prompt from selections, skipping empty/none values
 */
export function buildPrompt(selections: {
  trivia_game_type: string;
  topic: string;
  audience: string;
  number_of_questions: string;
  question_style: string;
  comparison_type: string;
  question_format: string;
  answer_format: string;
  fact_quality_1: string;
  fact_quality_2: string;
  output_format: string;
}): string {
  let prompt = '';

  // Core sentence structure
  if (selections.trivia_game_type && selections.topic && selections.audience) {
    prompt = `I am creating a ${selections.trivia_game_type} about ${selections.topic} for ${selections.audience}.`;
  }

  // Questions count and style
  if (selections.number_of_questions) {
    prompt += ` Generate ${selections.number_of_questions} trivia questions`;
    if (selections.question_style) {
      prompt += ` in ${selections.question_style}`;
    }
    prompt += `.`;
  }

  // Comparison type
  if (selections.comparison_type) {
    prompt += ` Include ${selections.comparison_type}.`;
  }

  // Question and answer format
  const formats = [];
  if (selections.question_format) formats.push(selections.question_format);
  if (selections.answer_format) formats.push(selections.answer_format);
  if (formats.length > 0) {
    prompt += ` Each question should have ${formats.join(' and ')}.`;
  }

  // Fact quality
  const qualities = [];
  if (selections.fact_quality_1) qualities.push(selections.fact_quality_1);
  if (selections.fact_quality_2) qualities.push(selections.fact_quality_2);
  if (qualities.length > 0) {
    prompt += ` Make sure the facts are ${qualities.join(' and ')}.`;
  }

  // Output format
  if (selections.output_format) {
    prompt += ` Format the output as ${selections.output_format}.`;
  }

  return prompt.trim();
}

/**
 * Get default selections (first option from required fields, empty for optional)
 */
export function getDefaultSelections(variables: Record<string, string[]>) {
  return {
    trivia_game_type: variables.trivia_game_type?.[0] || '',
    topic: variables.topic?.[0] || '',
    audience: variables.audience?.[0] || '',
    number_of_questions: variables.number_of_questions?.[0] || '10',
    question_style: '', // Optional - starts empty
    comparison_type: '', // Optional - starts empty
    question_format: '', // Optional - starts empty
    answer_format: '', // Optional - starts empty
    fact_quality_1: '', // Optional - starts empty
    fact_quality_2: '', // Optional - starts empty
    output_format: variables.output_format?.[0] || '',
  };
}
