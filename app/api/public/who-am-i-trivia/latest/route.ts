import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/public/who-am-i-trivia/latest - Get latest published Who Am I questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100); // Max 100

    // Query for latest published Who Am I questions
    const { data, error, count } = await supabaseAdmin
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
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching latest Who Am I questions:", error);
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
      count: data.length,
    });
  } catch (error) {
    console.error("GET /api/public/who-am-i-trivia/latest error:", error);
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
