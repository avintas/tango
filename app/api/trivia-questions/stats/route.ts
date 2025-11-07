import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/trivia-questions/stats
 * Get statistics for trivia questions across all types
 */
export async function GET(request: NextRequest) {
  try {
    // Get all questions with status from all three trivia tables
    const [multipleChoiceData, trueFalseData, whoAmIData] = await Promise.all([
      supabaseAdmin.from("trivia_multiple_choice").select("status"),
      supabaseAdmin.from("trivia_true_false").select("status"),
      supabaseAdmin.from("trivia_who_am_i").select("status"),
    ]);

    // Combine all questions
    const allQuestions = [
      ...(multipleChoiceData.data || []),
      ...(trueFalseData.data || []),
      ...(whoAmIData.data || []),
    ];

    // Count by status
    const stats = {
      draft: allQuestions.filter((q) => !q.status || q.status === "draft")
        .length,
      published: allQuestions.filter((q) => q.status === "published").length,
      archived: allQuestions.filter((q) => q.status === "archived").length,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching trivia stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stats: {
          draft: 0,
          published: 0,
          archived: 0,
        },
      },
      { status: 500 },
    );
  }
}
