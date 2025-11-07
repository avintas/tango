import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";

/**
 * Task 6: Validate & Finalize
 * Validates the trivia set and finalizes it
 */
export const validateFinalizeTask: ProcessBuilderTask = {
  id: "validate-finalize",
  name: "Validate & Finalize",
  description: "Validates the trivia set and finalizes it",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      const questionCount = context.rules.questionCount?.value as
        | number
        | undefined;

      // Get created record from Task 5
      const createResult = context.previousResults?.[4];
      if (
        !createResult?.data ||
        typeof createResult.data !== "object" ||
        createResult.data === null ||
        !("triviaSet" in createResult.data)
      ) {
        return {
          success: false,
          errors: [
            {
              code: "NO_TRIVIA_SET",
              message: "No trivia set from previous task",
              taskId: "validate-finalize",
            },
          ],
        };
      }

      const triviaSet = (createResult.data as { triviaSet: any }).triviaSet;
      const errors: Array<{ code: string; message: string }> = [];
      const warnings: string[] = [];

      // Validate question count matches rules
      if (questionCount !== undefined) {
        if (triviaSet.question_count !== questionCount) {
          warnings.push(
            `Question count mismatch: requested ${questionCount}, got ${triviaSet.question_count}`,
          );
        }
      }

      // Validate required fields
      if (!triviaSet.title || triviaSet.title.trim() === "") {
        errors.push({ code: "MISSING_TITLE", message: "Title is required" });
      }

      if (!triviaSet.slug || triviaSet.slug.trim() === "") {
        errors.push({ code: "MISSING_SLUG", message: "Slug is required" });
      }

      if (!triviaSet.question_data || !Array.isArray(triviaSet.question_data)) {
        errors.push({
          code: "INVALID_QUESTION_DATA",
          message: "question_data must be an array",
        });
      }

      if (triviaSet.question_count <= 0) {
        errors.push({
          code: "INVALID_QUESTION_COUNT",
          message: "question_count must be greater than 0",
        });
      }

      // Validate question structure
      if (Array.isArray(triviaSet.question_data)) {
        for (let i = 0; i < triviaSet.question_data.length; i++) {
          const question = triviaSet.question_data[i];

          if (!question.question_text || question.question_text.trim() === "") {
            errors.push({
              code: "INVALID_QUESTION",
              message: `Question ${i + 1}: Missing question_text`,
            });
          }

          if (!question.question_type) {
            errors.push({
              code: "INVALID_QUESTION",
              message: `Question ${i + 1}: Missing question_type`,
            });
          }

          if (!question.correct_answer) {
            errors.push({
              code: "INVALID_QUESTION",
              message: `Question ${i + 1}: Missing correct_answer`,
            });
          }

          // Type-specific validation
          if (question.question_type === "multiple-choice") {
            if (
              !Array.isArray(question.wrong_answers) ||
              question.wrong_answers.length < 2
            ) {
              errors.push({
                code: "INSUFFICIENT_OPTIONS",
                message: `Question ${i + 1}: Multiple choice must have at least 2 wrong answers`,
              });
            }

            // Check for duplicate answers
            const allAnswers = [
              question.correct_answer,
              ...question.wrong_answers,
            ];
            const uniqueAnswers = new Set(allAnswers);
            if (uniqueAnswers.size !== allAnswers.length) {
              errors.push({
                code: "DUPLICATE_ANSWERS",
                message: `Question ${i + 1}: Duplicate answer options found`,
              });
            }
          } else if (question.question_type === "true-false") {
            const correctAnswer = String(question.correct_answer).toLowerCase();
            if (correctAnswer !== "true" && correctAnswer !== "false") {
              errors.push({
                code: "INVALID_ANSWER",
                message: `Question ${i + 1}: True/False question must have 'true' or 'false' as correct answer`,
              });
            }
          }
        }
      }

      // Check for duplicate questions
      if (Array.isArray(triviaSet.question_data)) {
        const questionTexts = triviaSet.question_data.map((q: any) =>
          q.question_text?.toLowerCase().trim(),
        );
        const uniqueTexts = new Set(questionTexts);
        if (uniqueTexts.size !== questionTexts.length) {
          warnings.push("Duplicate questions found in set");
        }
      }

      // If there are errors, fail validation
      if (errors.length > 0) {
        return {
          success: false,
          errors: errors.map((err) => ({
            ...err,
            taskId: "validate-finalize",
          })),
          warnings,
        };
      }

      // Validation passed
      return {
        success: true,
        data: {
          validated: true,
          triviaSetId: triviaSet.id,
          triviaSet: triviaSet,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
          questionCount: triviaSet.question_count,
          validationPassed: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "VALIDATION_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "validate-finalize",
          },
        ],
      };
    }
  },
};
