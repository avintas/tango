import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TrueFalseTriviaCreateInput } from "@/lib/true-false-trivia-types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/true-false-trivia - Fetch entries with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statsOnly = searchParams.get("stats") === "true";

    if (statsOnly) {
      const { data: allItems } = await supabase
        .from("trivia_true_false")
        .select("status");

      if (!allItems) {
        return NextResponse.json({
          success: true,
          stats: { unpublished: 0, published: 0, archived: 0 },
        });
      }

      const stats = {
        unpublished: allItems.filter(
          (item) => item.status !== "published" && item.status !== "archived",
        ).length,
        published: allItems.filter((item) => item.status === "published")
          .length,
        archived: allItems.filter((item) => item.status === "archived").length,
      };

      return NextResponse.json({
        success: true,
        stats,
      });
    }

    const status = searchParams.get("status");
    const theme = searchParams.get("theme");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("trivia_true_false")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status) {
      if (status === "unpublished") {
        query = query.or(
          "status.is.null,and(status.not.eq.published,status.not.eq.archived)",
        );
      } else if (status === "published") {
        query = query.eq("status", "published");
      } else if (status === "archived") {
        query = query.eq("status", "archived");
      }
    }

    if (theme) {
      query = query.eq("theme", theme);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching true/false trivia:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch true/false trivia entries" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/true-false-trivia - Create new entry
export async function POST(request: NextRequest) {
  try {
    const body: TrueFalseTriviaCreateInput = await request.json();

    if (!body.question_text || typeof body.is_true !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: question_text and is_true",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("trivia_true_false")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Error creating true/false trivia:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create true/false trivia entry" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
