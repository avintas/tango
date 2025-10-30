import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  MultipleChoiceTrivia,
  MultipleChoiceTriviaUpdateInput,
  MultipleChoiceTriviaApiResponse,
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
// GET /api/multiple-choice-trivia/[id]
// =============================================================================
// Get single multiple choice trivia question by ID
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        } as MultipleChoiceTriviaApiResponse,
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("multiple_choice_trivia")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Multiple choice trivia question not found",
        } as MultipleChoiceTriviaApiResponse,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data as MultipleChoiceTrivia,
    } as MultipleChoiceTriviaApiResponse);
  } catch (error) {
    console.error("Error in GET /api/multiple-choice-trivia/[id]:", error);
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
// PUT /api/multiple-choice-trivia/[id]
// =============================================================================
// Update multiple choice trivia question (full update)
// Body: MultipleChoiceTriviaUpdateInput
// =============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        } as MultipleChoiceTriviaApiResponse,
        { status: 400 },
      );
    }

    const body: MultipleChoiceTriviaUpdateInput = await request.json();

    // Prepare update object (only include provided fields)
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.question_text !== undefined)
      updates.question_text = body.question_text;
    if (body.correct_answer !== undefined)
      updates.correct_answer = body.correct_answer;
    if (body.wrong_answers !== undefined)
      updates.wrong_answers = body.wrong_answers;
    if (body.explanation !== undefined) updates.explanation = body.explanation;
    if (body.category !== undefined) updates.category = body.category;
    if (body.theme !== undefined) updates.theme = body.theme;
    if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.attribution !== undefined) updates.attribution = body.attribution;
    if (body.status !== undefined) updates.status = body.status;
    if (body.used_in !== undefined) updates.used_in = body.used_in;
    if (body.display_order !== undefined)
      updates.display_order = body.display_order;

    // Validate wrong_answers if provided
    if (body.wrong_answers && body.wrong_answers.length !== 3) {
      return NextResponse.json(
        {
          success: false,
          error: "wrong_answers must contain exactly 3 items",
        } as MultipleChoiceTriviaApiResponse,
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("multiple_choice_trivia")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update multiple choice trivia question",
        } as MultipleChoiceTriviaApiResponse,
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data as MultipleChoiceTrivia,
    } as MultipleChoiceTriviaApiResponse);
  } catch (error) {
    console.error("Error in PUT /api/multiple-choice-trivia/[id]:", error);
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
// PATCH /api/multiple-choice-trivia/[id]
// =============================================================================
// Partial update (typically for status changes)
// Body: { status: 'draft' | 'published' | 'archived' }
// =============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        } as MultipleChoiceTriviaApiResponse,
        { status: 400 },
      );
    }

    const body = await request.json();

    // Prepare update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    // Handle status changes with timestamps
    if (body.status !== undefined) {
      updates.status = body.status;

      // Set status-based timestamps
      if (body.status === "published") {
        // Only set published_at if not already set
        const existing = await supabaseAdmin
          .from("multiple_choice_trivia")
          .select("published_at")
          .eq("id", id)
          .single();

        if (existing.data && !existing.data.published_at) {
          updates.published_at = new Date().toISOString();
        }
      } else if (body.status === "archived") {
        updates.archived_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabaseAdmin
      .from("multiple_choice_trivia")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update multiple choice trivia question",
        } as MultipleChoiceTriviaApiResponse,
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data as MultipleChoiceTrivia,
    } as MultipleChoiceTriviaApiResponse);
  } catch (error) {
    console.error("Error in PATCH /api/multiple-choice-trivia/[id]:", error);
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
// DELETE /api/multiple-choice-trivia/[id]
// =============================================================================
// Delete multiple choice trivia question
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        } as MultipleChoiceTriviaApiResponse,
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("multiple_choice_trivia")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting multiple choice trivia:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete multiple choice trivia question",
        } as MultipleChoiceTriviaApiResponse,
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    } as MultipleChoiceTriviaApiResponse);
  } catch (error) {
    console.error("Error in DELETE /api/multiple-choice-trivia/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as MultipleChoiceTriviaApiResponse,
      { status: 500 },
    );
  }
}
