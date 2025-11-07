import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/trivia-sets/latest
 * Fetch the latest published trivia set for display on front page
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const questionType = searchParams.get("type") || "multiple-choice"; // Default to multiple-choice
    const limit = parseInt(searchParams.get("limit") || "1");

    // Map question type to table name
    const tableMap: Record<string, string> = {
      "multiple-choice": "sets_trivia_multiple_choice",
      "true-false": "sets_trivia_true_false",
      "who-am-i": "sets_trivia_who_am_i",
    };

    const tableName = tableMap[questionType];
    if (!tableName) {
      return NextResponse.json(
        { success: false, error: `Invalid question type: ${questionType}` },
        { status: 400 },
      );
    }

    // Fetch latest published trivia sets
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select("*")
      .eq("status", "published")
      .eq("visibility", "Public")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
