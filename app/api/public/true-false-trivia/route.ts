import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/public/true-false-trivia?theme=Players&difficulty=Easy&limit=20 - Get published true/false trivia with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const theme = searchParams.get("theme");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Limit max results to 100 to prevent abuse
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    let query = supabase
      .from("true_false_trivia")
      .select(
        "id, question_text, is_true, explanation, category, theme, difficulty, attribution",
        {
          count: "exact",
        },
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

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

    // Apply pagination
    query = query.range(offset, offset + safeLimit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching true/false trivia:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch true/false trivia questions",
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data || [],
        count: count || 0,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}
