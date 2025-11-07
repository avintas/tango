import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { TriviaSetMetadata, TriviaQuestionData } from "../types";
import type { CreateTriviaSet } from "@/lib/supabase";

/**
 * Task 5: Create Record
 * Creates the trivia set record in database
 */
export const createRecordTask: ProcessBuilderTask = {
  id: "create-record",
  name: "Create Trivia Set Record",
  description: "Creates the trivia set record in database",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      // Ensure previousResults exists
      if (!context.previousResults || context.previousResults.length < 4) {
        return {
          success: false,
          errors: [
            {
              code: "MISSING_PREVIOUS_RESULTS",
              message: "Missing results from previous tasks",
              taskId: "create-record",
            },
          ],
        };
      }

      // Get metadata from Task 3
      const metadataResult = context.previousResults?.[2];
      if (!metadataResult?.data) {
        return {
          success: false,
          errors: [
            {
              code: "NO_METADATA",
              message: "No metadata from previous task",
              taskId: "create-record",
            },
          ],
        };
      }

      const metadata = metadataResult.data as TriviaSetMetadata;

      // Get question data from Task 4
      const assembleResult = context.previousResults?.[3];
      if (
        !assembleResult?.data ||
        typeof assembleResult.data !== "object" ||
        assembleResult.data === null ||
        !("questionData" in assembleResult.data)
      ) {
        return {
          success: false,
          errors: [
            {
              code: "NO_QUESTION_DATA",
              message: "No question data from previous task",
              taskId: "create-record",
            },
          ],
        };
      }

      const questionData = (
        assembleResult.data as { questionData: TriviaQuestionData[] }
      ).questionData;
      const questionCount = questionData.length;

      // Ensure question_count > 0 (required by check constraint)
      if (questionCount <= 0) {
        return {
          success: false,
          errors: [
            {
              code: "INVALID_QUESTION_COUNT",
              message: "Question count must be greater than 0",
              taskId: "create-record",
            },
          ],
        };
      }

      // Determine which table to use based on question type
      // Since we're creating pure sets (only one type), check the first question
      const firstQuestion = questionData[0];
      let tableName: string;

      if (firstQuestion.question_type === "who-am-i") {
        tableName = "sets_trivia_who_am_i";
      } else if (firstQuestion.question_type === "multiple-choice") {
        tableName = "sets_trivia_multiple_choice";
      } else if (firstQuestion.question_type === "true-false") {
        tableName = "sets_trivia_true_false";
      } else {
        return {
          success: false,
          errors: [
            {
              code: "UNKNOWN_QUESTION_TYPE",
              message: `Unknown question type: ${firstQuestion.question_type}`,
              taskId: "create-record",
            },
          ],
        };
      }

      // Prepare data for insertion
      const triviaSetData: CreateTriviaSet = {
        title: metadata.title,
        slug: metadata.slug,
        description: metadata.description,
        category: metadata.category,
        theme: metadata.theme,
        tags: metadata.tags,
        difficulty:
          (metadata.difficulty as "easy" | "medium" | "hard") || "medium",
        question_count: questionCount,
        question_data: questionData,
        status: "draft", // Always start as draft
        visibility: "Private", // Default to Private (matches table default)
      };

      // Insert into the correct table based on question type
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .insert(triviaSetData)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          errors: [
            {
              code: "DATABASE_ERROR",
              message: `Failed to create trivia set: ${error.message}`,
              taskId: "create-record",
              details: error,
            },
          ],
        };
      }

      if (!data) {
        return {
          success: false,
          errors: [
            {
              code: "NO_DATA_RETURNED",
              message: "Database insert succeeded but no data returned",
              taskId: "create-record",
            },
          ],
        };
      }

      return {
        success: true,
        data: {
          id: data.id,
          triviaSet: data,
          tableName: tableName, // Include table name in result
        },
        metadata: {
          triviaSetId: data.id,
          slug: data.slug,
          questionCount: data.question_count,
          tableName: tableName,
          questionType: firstQuestion.question_type,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "CREATE_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "create-record",
          },
        ],
      };
    }
  },
};
