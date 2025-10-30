import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/public/who-am-i-trivia/random - Get random published Who Am I question
export async function GET(request: NextRequest) {
  try {
    // Query for published Who Am I questions
    const { data, error } = await supabaseAdmin
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
      )
      .eq("status", "published")
      .limit(100); // Get pool of published questions

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

    // Select random question
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomQuestion = data[randomIndex];

    return NextResponse.json({
      success: true,
      data: randomQuestion,
    });
  } catch (error) {
    console.error("GET /api/public/who-am-i-trivia/random error:", error);
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
