import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";
import { CollectionContent, TriviaQuestion } from "@/lib/types";

// The items to save can be one of two types, so we accept a flexible array
interface SaveRequest {
  itemsToSave: (CollectionContent | TriviaQuestion)[];
  sourceContentId: string | null;
}

export async function POST(req: Request) {
  try {
    const { itemsToSave, sourceContentId }: SaveRequest = await req.json();

    if (
      !itemsToSave ||
      !Array.isArray(itemsToSave) ||
      itemsToSave.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "No items to save" },
        { status: 400 },
      );
    }

    // Determine content type from the first item. It can be one of two fields.
    const firstItem = itemsToSave[0];
    const contentType =
      "content_type" in firstItem
        ? firstItem.content_type
        : firstItem.question_type;

    let tableName: string;
    let recordsToInsert: any[];

    switch (contentType) {
      case "stat":
        tableName = "collection_stats";
        recordsToInsert = itemsToSave
          .filter((item): item is CollectionContent => "content_type" in item)
          .map((item) => ({
            stat_text: item.content_text,
            stat_value: item.stat_value,
            stat_category: item.stat_category,
            year: item.year,
            theme: item.theme,
            category: item.category,
            source_content_id: sourceContentId ? Number(sourceContentId) : null,
          }));
        break;

      case "motivational":
        tableName = "collection_motivational";
        recordsToInsert = itemsToSave
          .filter((item): item is CollectionContent => "content_type" in item)
          .map((item) => ({
            quote: item.content_text,
            attribution: item.author, // Map author to attribution column
            context: item.context,
            theme: item.theme,
            category: item.category,
            source_content_id: sourceContentId ? Number(sourceContentId) : null,
          }));
        break;

      case "greeting":
        tableName = "collection_greetings";
        recordsToInsert = itemsToSave
          .filter((item): item is CollectionContent => "content_type" in item)
          .map((item) => ({
            greeting_text: item.content_text,
            attribution: item.attribution,
            source_content_id: sourceContentId ? Number(sourceContentId) : null,
          }));
        break;

      case "wisdom":
        tableName = "collection_wisdom";
        recordsToInsert = itemsToSave
          .filter((item): item is CollectionContent => "content_type" in item)
          .map((item) => ({
            title: item.content_title || "Untitled",
            musing: item.musings || item.content_text,
            from_the_box: item.from_the_box,
            theme: item.theme,
            category: item.category,
            attribution: item.attribution || "Penalty Box Philosopher",
            source_content_id: sourceContentId ? Number(sourceContentId) : null,
          }));
        break;

      // Handle Trivia Types
      case "multiple-choice":
        tableName = "trivia_multiple_choice";
        recordsToInsert = itemsToSave
          .filter((item): item is TriviaQuestion => "question_type" in item)
          .map((item) => ({
            question_text: item.question_text,
            correct_answer: item.correct_answer,
            wrong_answers: item.wrong_answers,
            explanation: item.explanation,
            theme: item.theme,
            category: item.category,
            source_content_id: sourceContentId ? Number(sourceContentId) : null,
          }));
        break;

      case "true-false":
        tableName = "trivia_true_false";
        recordsToInsert = itemsToSave
          .filter((item): item is TriviaQuestion => "question_type" in item)
          .map((item) => ({
            question_text: item.question_text,
            is_true:
              item.correct_answer.toLowerCase() === "true" ? true : false,
            explanation: item.explanation,
            theme: item.theme,
            category: item.category,
            source_content_id: sourceContentId ? Number(sourceContentId) : null,
          }));
        break;

      case "who-am-i":
        tableName = "trivia_who_am_i";
        recordsToInsert = itemsToSave
          .filter((item): item is TriviaQuestion => "question_type" in item)
          .map((item) => ({
            question_text: item.question_text,
            correct_answer: item.correct_answer,
            explanation: item.explanation,
            theme: item.theme,
            category: item.category,
            source_content_id: sourceContentId ? Number(sourceContentId) : null,
          }));
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported content type for saving: ${contentType}`,
          },
          { status: 400 },
        );
    }

    const { data, error, count } = await supabaseAdmin
      .from(tableName)
      .insert(recordsToInsert)
      .select();

    if (error) {
      console.error(`Supabase error (${tableName} table):`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    if (sourceContentId && itemsToSave.length > 0) {
      const { error: rpcError } = await supabaseAdmin.rpc(
        "append_to_used_for",
        {
          target_id: Number(sourceContentId),
          usage_type: contentType,
        },
      );

      if (rpcError) {
        console.warn(
          `Content saved (Count: ${count}), but failed to track usage for source ID ${sourceContentId}:`,
          rpcError.message,
        );
      }
    }

    return NextResponse.json({
      success: true,
      data,
      count,
      table: tableName,
    });
  } catch (error) {
    console.error("API Save Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
