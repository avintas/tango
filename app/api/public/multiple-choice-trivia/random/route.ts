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
// GET /api/public/multiple-choice-trivia/random
// =============================================================================
// Public API: Get random published multiple choice trivia question(s)
// Query params: count (optional, default: 1) - number of random questions to fetch
// No authentication required
// CORS enabled
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get("count");
    const count = countParam ? Math.min(parseInt(countParam, 10), 100) : 1; // Max 100 questions

    // Get total count of published questions
    const { count: totalCount } = await supabaseAdmin
      .from("trivia_multiple_choice")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    if (!totalCount || totalCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No published multiple choice trivia questions found",
        },
        { status: 404 },
      );
    }

    // If requesting more questions than available, limit to available count
    const requestedCount = Math.min(count, totalCount);

    // Generate unique random offsets
    const randomOffsets = new Set<number>();
    while (randomOffsets.size < requestedCount) {
      const randomOffset = Math.floor(Math.random() * totalCount);
      randomOffsets.add(randomOffset);
    }

    // Fetch random questions
    const questions = [];
    for (const offset of Array.from(randomOffsets)) {
      const { data, error } = await supabaseAdmin
        .from("trivia_multiple_choice")
        .select(
          "id, question_text, correct_answer, wrong_answers, explanation, category, theme, difficulty, attribution",
        )
        .eq("status", "published")
        .range(offset, offset)
        .single();

      if (!error && data) {
        questions.push(data);
      }
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch random multiple choice trivia questions",
        },
        { status: 500 },
      );
    }

    // Return single object if count is 1 (backward compatibility), otherwise array
    return NextResponse.json({
      success: true,
      data: count === 1 ? questions[0] : questions,
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
