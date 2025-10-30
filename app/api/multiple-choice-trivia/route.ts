import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  MultipleChoiceTrivia,
  MultipleChoiceTriviaCreateInput,
  MultipleChoiceTriviaApiResponse,
  validateMultipleChoiceTriviaInput,
} from "@/lib/multiple-choice-trivia-types";

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
// GET /api/multiple-choice-trivia
// =============================================================================
// List/filter multiple choice trivia questions
// Query params: limit, offset, status, theme, category, difficulty
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Filters
    const status = searchParams.get("status");
    const theme = searchParams.get("theme");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");

    // Build query
    let query = supabaseAdmin
      .from("trivia_multiple_choice")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      // Support comma-separated statuses: "published,draft"
      const statuses = status.split(",").map((s) => s.trim());
      query = query.in("status", statuses);
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

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching multiple choice trivia:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch multiple choice trivia questions",
        } as MultipleChoiceTriviaApiResponse,
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data as MultipleChoiceTrivia[],
      count: count || 0,
    } as MultipleChoiceTriviaApiResponse);
  } catch (error) {
    console.error("Error in GET /api/multiple-choice-trivia:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as MultipleChoiceTriviaApiResponse,
      { status: 500 },
    );
  }
}

// =============================================================================
// POST /api/multiple-choice-trivia
// =============================================================================
// Create new multiple choice trivia question
// Body: MultipleChoiceTriviaCreateInput
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: MultipleChoiceTriviaCreateInput = await request.json();

    // Validate input
    const validation = validateMultipleChoiceTriviaInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${validation.errors.join(", ")}`,
        } as MultipleChoiceTriviaApiResponse,
        { status: 400 },
      );
    }

    // Prepare record for insertion
    const record = {
      question_text: body.question_text,
      correct_answer: body.correct_answer,
      wrong_answers: body.wrong_answers,
      explanation: body.explanation || null,
      category: body.category || null,
      theme: body.theme || null,
      difficulty: body.difficulty || null,
      tags: body.tags || null,
      attribution: body.attribution || null,
      status: body.status || "draft",
      source_content_id: body.source_content_id || null,
    };

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from("trivia_multiple_choice")
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error("Error creating multiple choice trivia:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create multiple choice trivia question",
        } as MultipleChoiceTriviaApiResponse,
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data as MultipleChoiceTrivia,
      } as MultipleChoiceTriviaApiResponse,
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in POST /api/multiple-choice-trivia:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as MultipleChoiceTriviaApiResponse,
      { status: 500 },
    );
  }
}
