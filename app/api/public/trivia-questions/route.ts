import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/public/trivia-questions - Get total count of all published trivia questions
// This endpoint aggregates counts from all three trivia types:
// - Multiple Choice (trivia_multiple_choice)
// - True/False (trivia_true_false)
// - Who Am I (trivia_who_am_i)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Fetch counts from all three trivia tables in parallel
    const [multipleChoiceResult, trueFalseResult, whoAmIResult] =
      await Promise.all([
        // Multiple Choice count
        supabase
          .from("trivia_multiple_choice")
          .select("*", { count: "exact", head: true })
          .eq("status", "published"),
        // True/False count
        supabase
          .from("trivia_true_false")
          .select("*", { count: "exact", head: true })
          .eq("status", "published"),
        // Who Am I count
        supabase
          .from("trivia_who_am_i")
          .select("*", { count: "exact", head: true })
          .eq("status", "published"),
      ]);

    // Extract counts (handle errors gracefully)
    const multipleChoiceCount =
      multipleChoiceResult.count !== null ? multipleChoiceResult.count : 0;
    const trueFalseCount =
      trueFalseResult.count !== null ? trueFalseResult.count : 0;
    const whoAmICount = whoAmIResult.count !== null ? whoAmIResult.count : 0;

    // Calculate total count
    const totalCount = multipleChoiceCount + trueFalseCount + whoAmICount;

    // If there are errors, log them but still return partial data
    if (multipleChoiceResult.error) {
      console.error(
        "Error fetching multiple choice trivia count:",
        multipleChoiceResult.error,
      );
    }
    if (trueFalseResult.error) {
      console.error(
        "Error fetching true/false trivia count:",
        trueFalseResult.error,
      );
    }
    if (whoAmIResult.error) {
      console.error(
        "Error fetching who am i trivia count:",
        whoAmIResult.error,
      );
    }

    // Return aggregated count data
    return NextResponse.json(
      {
        success: true,
        data: {
          total: totalCount,
          multipleChoice: multipleChoiceCount,
          trueFalse: trueFalseCount,
          whoAmI: whoAmICount,
        },
        count: totalCount,
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
      {
        success: false,
        error: "Internal server error",
        data: {
          total: 0,
          multipleChoice: 0,
          trueFalse: 0,
          whoAmI: 0,
        },
        count: 0,
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
