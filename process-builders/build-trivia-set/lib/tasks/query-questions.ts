import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { QuestionCandidate } from "../types";

/**
 * Task 1: Query Source Questions
 * Fetches questions from database matching theme and types
 */
export const queryQuestionsTask: ProcessBuilderTask = {
  id: "query-questions",
  name: "Query Source Questions",
  description: "Fetches questions from database matching theme and types",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      const theme = context.goal.text; // Extract theme from goal
      const questionTypes = context.rules.questionTypes?.value as
        | string[]
        | undefined;

      if (!questionTypes || !Array.isArray(questionTypes)) {
        return {
          success: false,
          errors: [
            {
              code: "INVALID_RULES",
              message: "questionTypes rule is required and must be an array",
              taskId: "query-questions",
            },
          ],
        };
      }

      const candidates: QuestionCandidate[] = [];

      // Query TMC (trivia_multiple_choice) if requested
      if (
        questionTypes.includes("TMC") ||
        questionTypes.includes("multiple-choice")
      ) {
        const { data, error } = await supabaseAdmin
          .from("trivia_multiple_choice")
          .select("*")
          .eq("status", "published");

        if (error) {
          return {
            success: false,
            errors: [
              {
                code: "QUERY_ERROR",
                message: `Failed to query TMC: ${error.message}`,
                taskId: "query-questions",
              },
            ],
          };
        }

        if (data) {
          candidates.push(
            ...data.map((q) => ({
              ...q,
              question_type: "multiple-choice" as const,
              source_table: "trivia_multiple_choice" as const,
              wrong_answers: q.wrong_answers || [],
            })),
          );
        }
      }

      // Query TFT (trivia_true_false) if requested
      if (
        questionTypes.includes("TFT") ||
        questionTypes.includes("true-false")
      ) {
        const { data, error } = await supabaseAdmin
          .from("trivia_true_false")
          .select("*")
          .eq("status", "published");

        if (error) {
          return {
            success: false,
            errors: [
              {
                code: "QUERY_ERROR",
                message: `Failed to query TFT: ${error.message}`,
                taskId: "query-questions",
              },
            ],
          };
        }

        if (data) {
          candidates.push(
            ...data.map((q) => ({
              ...q,
              question_type: "true-false" as const,
              source_table: "trivia_true_false" as const,
              correct_answer: q.is_true ? "true" : "false",
              wrong_answers: [],
            })),
          );
        }
      }

      // Query WAI (trivia_who_am_i) if requested
      if (questionTypes.includes("WAI") || questionTypes.includes("who-am-i")) {
        const { data, error } = await supabaseAdmin
          .from("trivia_who_am_i")
          .select("*")
          .eq("status", "published");

        if (error) {
          return {
            success: false,
            errors: [
              {
                code: "QUERY_ERROR",
                message: `Failed to query WAI: ${error.message}`,
                taskId: "query-questions",
              },
            ],
          };
        }

        if (data) {
          candidates.push(
            ...data.map((q) => ({
              ...q,
              question_type: "who-am-i" as const,
              source_table: "trivia_who_am_i" as const,
              correct_answer: q.correct_answer || "",
              wrong_answers: [], // Who Am I questions don't have wrong answers
            })),
          );
        }
      }

      // Filter by theme if provided (simple keyword matching)
      let filteredCandidates = candidates;
      if (theme && theme.trim() !== "") {
        const themeLower = theme.toLowerCase();
        filteredCandidates = candidates.filter((q) => {
          const questionText = (q.question_text || "").toLowerCase();
          const questionTheme = (q.theme || "").toLowerCase();
          const questionTags = (q.tags || []).join(" ").toLowerCase();

          return (
            questionText.includes(themeLower) ||
            questionTheme.includes(themeLower) ||
            questionTags.includes(themeLower)
          );
        });
      }

      return {
        success: true,
        data: { candidates: filteredCandidates },
        metadata: {
          candidateCount: filteredCandidates.length,
          totalCandidates: candidates.length,
          theme: theme || "all",
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "QUERY_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "query-questions",
          },
        ],
      };
    }
  },
};
