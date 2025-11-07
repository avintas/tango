import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  CreateSourceContentIngested,
  SourceContentCategory,
} from "@/lib/supabase";
import type { Theme } from "@/components/theme-selector";

/**
 * Task 6: Create Record
 * Creates the source_content_ingested record in the database
 */
export const createRecordTask: ProcessBuilderTask = {
  id: "create-record",
  name: "Create Record",
  description: "Creates the source_content_ingested record in the database",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      // Collect all data from previous tasks
      const processedResult = context.previousResults?.[0];
      const metadataResult = context.previousResults?.[1];
      const summaryResult = context.previousResults?.[2];
      const titleKeyPhrasesResult = context.previousResults?.[3];

      if (!processedResult?.success || !processedResult.data) {
        return {
          success: false,
          errors: [
            {
              code: "MISSING_PROCESSED_CONTENT",
              message: "Processed content is required to create record",
              taskId: "create-record",
            },
          ],
        };
      }

      const processedContent = processedResult.data as {
        content_text: string;
        word_count: number;
        char_count: number;
      };

      const metadata = metadataResult?.data as
        | {
            theme: string;
            tags?: string[];
            category?: string;
          }
        | undefined;

      const summary = summaryResult?.data as { summary?: string } | undefined;
      const titleKeyPhrases = titleKeyPhrasesResult?.data as
        | {
            title?: string;
            key_phrases?: string[];
          }
        | undefined;

      if (!metadata?.theme) {
        return {
          success: false,
          errors: [
            {
              code: "MISSING_THEME",
              message: "Theme is required to create record",
              taskId: "create-record",
            },
          ],
        };
      }

      // Prepare data for insertion
      const recordData: CreateSourceContentIngested = {
        content_text: processedContent.content_text,
        word_count: processedContent.word_count,
        char_count: processedContent.char_count,
        theme: metadata.theme as Theme,
        tags: metadata.tags,
        category: metadata.category as SourceContentCategory | undefined,
        summary: summary?.summary,
        title: titleKeyPhrases?.title,
        key_phrases: titleKeyPhrases?.key_phrases,
        ingestion_status: "complete",
        ingestion_process_id: context.metadata?.processId as string | undefined,
      };

      // Insert into database
      const { data, error } = await supabaseAdmin
        .from("source_content_ingested")
        .insert(recordData)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          errors: [
            {
              code: "DATABASE_ERROR",
              message: `Failed to create record: ${error.message}`,
              taskId: "create-record",
              details: error,
            },
          ],
        };
      }

      return {
        success: true,
        data: { record: data },
        metadata: {
          recordId: data.id,
          createdAt: data.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "CREATE_RECORD_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "create-record",
          },
        ],
      };
    }
  },

  retryable: true,
  maxRetries: 2,
  retryDelay: 2000,
  timeout: 30000,
};
