import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const questionType = searchParams.get("question_type");
    const theme = searchParams.get("theme");

    let query = supabaseAdmin
      .from("trivia_questions")
      .select("*", { count: "exact" });

    // Apply filters
    if (status) {
      // Handle comma-separated list for multiple statuses
      if (status.includes(",")) {
        query = query.in("status", status.split(","));
      } else {
        query = query.eq("status", status);
      }
    } else {
      // By default, if no status is specified, exclude archived questions
      query = query.not("status", "eq", "archived");
    }

    if (questionType) {
      query = query.eq("question_type", questionType);
    }

    if (theme) {
      query = query.eq("theme", theme);
    }

    // Apply ordering and pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch trivia questions: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      total: count || 0,
    });
  } catch (error) {
    console.error("Fetch trivia questions error:", error);

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
