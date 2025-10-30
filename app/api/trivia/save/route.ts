import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import { TriviaQuestion } from "@/lib/types";

interface SaveTriviaRequest {
  itemsToSave: TriviaQuestion[];
  sourceContentId: string | null;
  createdBy: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const { itemsToSave, sourceContentId, createdBy }: SaveTriviaRequest =
      await req.json();

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

    // Determine which table to use based on question type
    const questionType = itemsToSave[0].question_type;
    let tableName: string;

    switch (questionType) {
      case "multiple-choice":
        tableName = "trivia_multiple_choice";
        break;
      case "true-false":
        tableName = "true_false_trivia";
        break;
      case "who-am-i":
        tableName = "trivia_who_am_i";
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unknown question type: ${questionType}` },
          { status: 400 },
        );
    }

    const recordsToInsert = itemsToSave.map((item) => ({
      question_type: item.question_type,
      question_text: item.question_text,
      correct_answer: item.correct_answer,
      wrong_answers: item.wrong_answers,
      explanation: item.explanation,
      theme: item.theme,
      created_by: createdBy,
      source_content_id: sourceContentId ? Number(sourceContentId) : null,
    }));

    const { data, error, count } = await supabaseAdmin
      .from(tableName)
      .insert(recordsToInsert)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message);
    }

    if (sourceContentId && itemsToSave.length > 0) {
      const questionType = itemsToSave[0].question_type;

      const { error: rpcError } = await supabaseAdmin.rpc(
        "append_to_used_for",
        {
          target_id: Number(sourceContentId),
          usage_type: questionType,
        },
      );

      if (rpcError) {
        console.warn(
          `Trivia questions saved (Count: ${count}), but failed to track usage for source ID ${sourceContentId}:`,
          rpcError.message,
        );
      }
    }

    return NextResponse.json({ success: true, data, count });
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
