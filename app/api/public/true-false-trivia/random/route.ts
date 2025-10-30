import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/public/true-false-trivia/random - Get a random published true/false trivia question
export async function GET() {
  try {
    // Fetch all published true/false trivia questions
    const { data, error } = await supabase
      .from("true_false_trivia")
      .select(
        "id, question_text, is_true, explanation, category, theme, difficulty, attribution",
      )
      .eq("status", "published")
      .order("id", { ascending: true });

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

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No published true/false trivia questions found",
        },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        },
      );
    }

    // Select random entry
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomQuestion = data[randomIndex];

    return NextResponse.json(
      {
        success: true,
        data: randomQuestion,
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
