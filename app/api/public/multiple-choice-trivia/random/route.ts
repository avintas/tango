import { NextResponse } from "next/server";
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
// GET /api/public/multiple-choice-trivia/random
// =============================================================================
// Public API: Get random published multiple choice trivia question
// No authentication required
// CORS enabled
// =============================================================================

export async function GET() {
  try {
    // Get count of published questions
    const { count } = await supabaseAdmin
      .from("trivia_multiple_choice")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    if (!count || count === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No published multiple choice trivia questions found",
        },
        { status: 404 },
      );
    }

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count);

    // Fetch random question
    const { data, error } = await supabaseAdmin
      .from("trivia_multiple_choice")
      .select(
        "id, question_text, correct_answer, wrong_answers, explanation, category, theme, difficulty, attribution",
      )
      .eq("status", "published")
      .range(randomOffset, randomOffset)
      .single();

    if (error || !data) {
      console.error("Error fetching random multiple choice trivia:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch random multiple choice trivia question",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Error in GET /api/public/multiple-choice-trivia/random:",
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
