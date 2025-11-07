import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";
import type { QuestionSelectionResult, TriviaSetMetadata } from "../types";

/**
 * Task 3: Generate Metadata
 * Generates metadata for the trivia set (title, slug, description, etc.)
 */
export const generateMetadataTask: ProcessBuilderTask = {
  id: "generate-metadata",
  name: "Generate Metadata",
  description: "Generates metadata for the trivia set",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      const theme = context.goal.text.trim();
      const previousResult = context.previousResults?.[1]; // From select-balance task

      if (
        !previousResult?.data ||
        typeof previousResult.data !== "object" ||
        previousResult.data === null ||
        !("selected" in previousResult.data)
      ) {
        return {
          success: false,
          errors: [
            {
              code: "NO_SELECTED_QUESTIONS",
              message: "No selected questions from previous task",
              taskId: "generate-metadata",
            },
          ],
        };
      }

      const selectionResult = previousResult.data as QuestionSelectionResult;
      const selectedQuestions = selectionResult.selected;
      const questionCount = selectedQuestions.length;

      // Generate title
      const title = generateTitle(theme);

      // Generate slug
      const slug = generateSlug(theme);

      // Generate description
      const description = generateDescription(
        theme,
        questionCount,
        selectedQuestions,
      );

      // Determine category
      const category = determineCategory(theme);

      // Extract tags
      const tags = extractTags(selectedQuestions, theme);

      // Calculate difficulty
      const difficulty = calculateDifficulty(selectedQuestions);

      // Extract sub-themes
      const subThemes = extractSubThemes(selectedQuestions);

      // Estimate duration (rough estimate: 30 seconds per question)
      const estimatedDuration = questionCount * 0.5; // minutes

      const metadata: TriviaSetMetadata = {
        title,
        slug,
        description,
        category,
        theme,
        tags,
        difficulty,
        estimated_duration: Math.round(estimatedDuration),
        sub_themes: subThemes,
      };

      return {
        success: true,
        data: metadata,
        metadata: {
          questionCount,
          difficulty,
          subThemeCount: subThemes.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "METADATA_GENERATION_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "generate-metadata",
          },
        ],
      };
    }
  },
};

/**
 * Generate title from theme
 */
function generateTitle(theme: string): string {
  // Capitalize first letter of each word
  const words = theme.split(" ").map((word) => {
    if (word.length === 0) return word;
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  });

  return words.join(" ") + " Trivia";
}

/**
 * Generate slug from theme
 */
function generateSlug(theme: string): string {
  return (
    theme
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, "") + // Remove leading/trailing hyphens
    "-trivia"
  );
}

/**
 * Generate description
 */
function generateDescription(
  theme: string,
  questionCount: number,
  questions: any[],
): string {
  const difficulty = calculateDifficulty(questions);
  const difficultyLabel =
    difficulty === "easy"
      ? "beginner-friendly"
      : difficulty === "hard"
        ? "challenging"
        : "intermediate";

  return `Test your knowledge with this ${difficultyLabel} ${theme} trivia set featuring ${questionCount} carefully curated questions.`;
}

/**
 * Determine category from theme
 */
function determineCategory(theme: string): string {
  const themeLower = theme.toLowerCase();

  // Simple keyword-based categorization
  if (
    themeLower.includes("hockey") ||
    themeLower.includes("nhl") ||
    themeLower.includes("sport")
  ) {
    return "Sports";
  }

  if (
    themeLower.includes("december") ||
    themeLower.includes("christmas") ||
    themeLower.includes("winter") ||
    themeLower.includes("january") ||
    themeLower.includes("february") ||
    themeLower.includes("march") ||
    themeLower.includes("april") ||
    themeLower.includes("may") ||
    themeLower.includes("june") ||
    themeLower.includes("july") ||
    themeLower.includes("august") ||
    themeLower.includes("september") ||
    themeLower.includes("october") ||
    themeLower.includes("november")
  ) {
    return "Seasonal";
  }

  if (themeLower.includes("history")) {
    return "History";
  }

  if (themeLower.includes("player") || themeLower.includes("team")) {
    return "Players & Teams";
  }

  return "General";
}

/**
 * Extract tags from questions and theme
 */
function extractTags(questions: any[], theme: string): string[] {
  const tags = new Set<string>();

  // Add theme as primary tag
  tags.add(theme);

  // Extract tags from questions
  for (const question of questions) {
    if (question.tags && Array.isArray(question.tags)) {
      question.tags.forEach((tag: string) => tags.add(tag));
    }
    if (question.theme) {
      tags.add(question.theme);
    }
  }

  // Limit to top 10 most common/relevant tags
  return Array.from(tags).slice(0, 10);
}

/**
 * Calculate average difficulty
 */
function calculateDifficulty(questions: any[]): "easy" | "medium" | "hard" {
  if (questions.length === 0) return "medium";

  const difficultyMap: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  let totalDifficulty = 0;
  let count = 0;

  for (const question of questions) {
    const diff = question.difficulty?.toLowerCase() || "medium";
    if (diff in difficultyMap) {
      totalDifficulty += difficultyMap[diff];
      count++;
    }
  }

  if (count === 0) return "medium";

  const avgDifficulty = totalDifficulty / count;

  if (avgDifficulty <= 1.3) return "easy";
  if (avgDifficulty <= 2.3) return "medium";
  return "hard";
}

/**
 * Extract sub-themes from questions
 */
function extractSubThemes(questions: any[]): string[] {
  const themeCount: Record<string, number> = {};

  for (const question of questions) {
    if (question.tags && Array.isArray(question.tags)) {
      question.tags.forEach((tag: string) => {
        themeCount[tag] = (themeCount[tag] || 0) + 1;
      });
    }
    if (question.theme) {
      themeCount[question.theme] = (themeCount[question.theme] || 0) + 1;
    }
  }

  // Sort by frequency and return top 5
  return Object.entries(themeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);
}
