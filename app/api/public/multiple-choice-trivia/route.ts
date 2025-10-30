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
// GET /api/public/multiple-choice-trivia
// =============================================================================
// Public API: Get published multiple choice trivia questions with filters
// Query params: theme, category, difficulty, limit, offset
// No authentication required
// CORS enabled
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Max 100
    const offset = parseInt(searchParams.get("offset") || "0");

    // Filters
    const theme = searchParams.get("theme");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");

    // Build query - only published items
    let query = supabaseAdmin
      .from("multiple_choice_trivia")
      .select(
        "id, question_text, correct_answer, wrong_answers, explanation, category, theme, difficulty, attribution",
        { count: "exact" },
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (theme) {
      query = query.eq("theme", theme);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching multiple choice trivia:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch multiple choice trivia questions",
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
    console.error("Error in GET /api/public/multiple-choice-trivia:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
