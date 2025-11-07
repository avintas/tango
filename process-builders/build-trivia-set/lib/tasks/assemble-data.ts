import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";
import type {
  TriviaQuestionData,
  QuestionSelectionResult,
  TriviaSetMetadata,
} from "../types";

/**
 * Task 4: Assemble Question Data
 * Assembles question data into final format for trivia_sets table
 */
export const assembleDataTask: ProcessBuilderTask = {
  id: "assemble-data",
  name: "Assemble Question Data",
  description: "Assembles question data into final format",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      // Get selected questions from Task 2
      const selectResult = context.previousResults?.[1];
      if (
        !selectResult?.data ||
        typeof selectResult.data !== "object" ||
        selectResult.data === null ||
        !("selected" in selectResult.data)
      ) {
        return {
          success: false,
          errors: [
            {
              code: "NO_SELECTED_QUESTIONS",
              message: "No selected questions from previous task",
              taskId: "assemble-data",
            },
          ],
        };
      }

      const selectionResult = selectResult.data as QuestionSelectionResult;
      const selectedQuestions = selectionResult.selected;

      // Transform to TriviaQuestionData format
      const questionData: TriviaQuestionData[] = selectedQuestions.map(
        (question, index) => {
          const transformed: TriviaQuestionData = {
            question_id: `q-${question.id}-${index}`, // Unique ID for this instance
            source_id: question.id, // Reference to source question
            question_text: question.question_text,
            question_type: question.question_type,
            correct_answer: question.correct_answer,
            wrong_answers: question.wrong_answers || [],
            explanation: question.explanation,
            tags: question.tags || [],
            difficulty: mapDifficultyToNumber(question.difficulty),
            points: calculatePoints(question.difficulty),
            time_limit: 30, // Default 30 seconds per question
          };

          // For multiple choice, shuffle wrong answers (correct answer stays separate)
          // The frontend will shuffle all options when displaying
          if (
            question.question_type === "multiple-choice" &&
            transformed.wrong_answers.length > 0
          ) {
            transformed.wrong_answers = shuffleArray([
              ...transformed.wrong_answers,
            ]);
          }

          return transformed;
        },
      );

      // Shuffle question order
      const shuffledQuestions = shuffleArray(questionData);

      return {
        success: true,
        data: { questionData: shuffledQuestions },
        metadata: {
          questionCount: shuffledQuestions.length,
          questionTypes: {
            multipleChoice: shuffledQuestions.filter(
              (q) => q.question_type === "multiple-choice",
            ).length,
            trueFalse: shuffledQuestions.filter(
              (q) => q.question_type === "true-false",
            ).length,
            whoAmI: shuffledQuestions.filter(
              (q) => q.question_type === "who-am-i",
            ).length,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "ASSEMBLY_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "assemble-data",
          },
        ],
      };
    }
  },
};

/**
 * Map difficulty string to number (1-3)
 */
function mapDifficultyToNumber(difficulty?: string): number {
  if (!difficulty) return 2; // Default medium

  const diffLower = difficulty.toLowerCase();
  if (diffLower === "easy") return 1;
  if (diffLower === "medium") return 2;
  if (diffLower === "hard") return 3;

  return 2; // Default medium
}

/**
 * Calculate points based on difficulty
 */
function calculatePoints(difficulty?: string): number {
  const diffNum = mapDifficultyToNumber(difficulty);
  return diffNum * 10; // Easy=10, Medium=20, Hard=30
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
