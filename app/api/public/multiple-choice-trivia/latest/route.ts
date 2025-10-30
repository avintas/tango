import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering (disable static optimization)
export const dynamic = "force-dynamic";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// =============================================================================
// GET /api/public/multiple-choice-trivia/latest
// =============================================================================
// Public API: Get latest published multiple choice trivia questions
// Query params: limit (default 10, max 100)
// No authentication required
// CORS enabled
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100); // Max 100

    // Fetch latest published questions
    const { data, error, count } = await supabaseAdmin
      .from("trivia_multiple_choice")
      .select(
        "id, question_text, correct_answer, wrong_answers, explanation, category, theme, difficulty, attribution",
        { count: "exact" },
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching latest multiple choice trivia:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch latest multiple choice trivia questions",
        },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No published multiple choice trivia questions found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count: count || 0,
    });
  } catch (error) {
    console.error(
      "Error in GET /api/public/multiple-choice-trivia/latest:",
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
