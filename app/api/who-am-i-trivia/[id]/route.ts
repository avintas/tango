import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { WhoAmITriviaUpdateInput } from "@/lib/who-am-i-trivia-types";

// GET /api/who-am-i-trivia/[id] - Get single Who Am I question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { data, error } = await supabaseAdmin
      .from("trivia_who_am_i")
      .select("*")
      .eq("id", (await params).id)
      .single();

    if (error) {
      console.error("Error fetching Who Am I question:", error);
      return NextResponse.json(
        { success: false, error: "Who Am I question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/who-am-i-trivia/[id] error:", error);
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

// PUT /api/who-am-i-trivia/[id] - Update Who Am I question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body: WhoAmITriviaUpdateInput = await request.json();

    const { data, error } = await supabaseAdmin
      .from("trivia_who_am_i")
      .update({
        question_text: body.question_text,
        correct_answer: body.correct_answer,
        explanation: body.explanation,
        category: body.category,
        theme: body.theme,
        difficulty: body.difficulty,
        tags: body.tags,
        attribution: body.attribution,
        status: body.status,
        display_order: body.display_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (await params).id)
      .select()
      .single();

    if (error) {
      console.error("Error updating Who Am I question:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update Who Am I question" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("PUT /api/who-am-i-trivia/[id] error:", error);
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

// PATCH /api/who-am-i-trivia/[id] - Partial update (status changes, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body: Partial<WhoAmITriviaUpdateInput> = await request.json();

    // Special handling for status changes
    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Set status-specific timestamps
    if (body.status === "published" && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    } else if (body.status === "archived" && !updateData.archived_at) {
      updateData.archived_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("trivia_who_am_i")
      .update(updateData)
      .eq("id", (await params).id)
      .select()
      .single();

    if (error) {
      console.error("Error patching Who Am I question:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update Who Am I question" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("PATCH /api/who-am-i-trivia/[id] error:", error);
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

// DELETE /api/who-am-i-trivia/[id] - Delete Who Am I question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await supabaseAdmin
      .from("trivia_who_am_i")
      .delete()
      .eq("id", (await params).id);

    if (error) {
      console.error("Error deleting Who Am I question:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete Who Am I question" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Who Am I question deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/who-am-i-trivia/[id] error:", error);
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
