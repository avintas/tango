import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/public/who-am-i-trivia - Get filtered/paginated published Who Am I questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const theme = searchParams.get("theme");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Max 100
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query - only published questions
    let query = supabaseAdmin
      .from("trivia_who_am_i")
      .select(
        `
        id,
        question_text,
        correct_answer,
        explanation,
        category,
        theme,
        difficulty,
        attribution
      `,
        { count: "exact" },
      )
      .eq("status", "published");

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

    // Apply pagination and sorting
    query = query
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching Who Am I questions:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch Who Am I questions",
        },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No published Who Am I questions found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count,
    });
  } catch (error) {
    console.error("GET /api/public/who-am-i-trivia error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

// Enable CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
