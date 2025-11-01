import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  WhoAmITrivia,
  WhoAmITriviaCreateInput,
  WhoAmITriviaFetchParams,
} from "@/lib/who-am-i-trivia-types";

// GET /api/who-am-i-trivia - List/filter Who Am I questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get("stats") === "true";

    if (statsOnly) {
      const { data: allItems } = await supabaseAdmin
        .from("trivia_who_am_i")
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

    // Parse query parameters
    const params: WhoAmITriviaFetchParams = {
      theme: searchParams.get("theme") || undefined,
      category: searchParams.get("category") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      status: searchParams.get("status") || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    // Build query
    let query = supabaseAdmin
      .from("trivia_who_am_i")
      .select("*", { count: "exact" });

    // Apply filters
    if (params.theme) {
      query = query.eq("theme", params.theme);
    }
    if (params.category) {
      query = query.eq("category", params.category);
    }
    if (params.difficulty) {
      query = query.eq("difficulty", params.difficulty);
    }
    if (params.status) {
      if (params.status === "unpublished") {
        query = query.or(
          "status.is.null,and(status.not.eq.published,status.not.eq.archived)",
        );
      } else if (params.status === "published") {
        query = query.eq("status", "published");
      } else if (params.status === "archived") {
        query = query.eq("status", "archived");
      }
    }

    // Apply pagination and sorting
    query = query
      .order("created_at", { ascending: false })
      .range(params.offset!, params.offset! + params.limit! - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching Who Am I questions:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch Who Am I questions" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count,
    });
  } catch (error) {
    console.error("GET /api/who-am-i-trivia error:", error);
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

// POST /api/who-am-i-trivia - Create new Who Am I question
export async function POST(request: NextRequest) {
  try {
    const body: WhoAmITriviaCreateInput = await request.json();

    // Validate required fields
    if (!body.question_text || !body.correct_answer) {
      return NextResponse.json(
        {
          success: false,
          error: "question_text and correct_answer are required",
        },
        { status: 400 },
      );
    }

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from("trivia_who_am_i")
      .insert({
        question_text: body.question_text,
        correct_answer: body.correct_answer,
        explanation: body.explanation || null,
        category: body.category || null,
        theme: body.theme || null,
        difficulty: body.difficulty || null,
        tags: body.tags || null,
        attribution: body.attribution || null,
        status: body.status || "draft",
        source_content_id: body.source_content_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating Who Am I question:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create Who Am I question" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("POST /api/who-am-i-trivia error:", error);
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
