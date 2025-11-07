import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TrueFalseTriviaUpdateInput } from "@/lib/true-false-trivia-types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/true-false-trivia/[id] - Get single entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const { data, error } = await supabase
      .from("trivia_true_false")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching true/false trivia:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch true/false trivia entry" },
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

// PUT /api/true-false-trivia/[id] - Update entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const body: TrueFalseTriviaUpdateInput = await request.json();

    const { data, error } = await supabase
      .from("trivia_true_false")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating true/false trivia:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update true/false trivia entry" },
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

// PATCH /api/true-false-trivia/[id] - Partially update entry (e.g., status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const body: Partial<TrueFalseTriviaUpdateInput> = await request.json();

    const updateData: Record<string, any> = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    if (body.status === "published" && !body.published_at) {
      updateData.published_at = new Date().toISOString();
    } else if (body.status === "archived" && !body.archived_at) {
      updateData.archived_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("trivia_true_false")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error patching true/false trivia:", error);
      return NextResponse.json(
        { success: false, error: "Failed to patch true/false trivia entry" },
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

// DELETE /api/true-false-trivia/[id] - Delete entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    const { error } = await supabase
      .from("trivia_true_false")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting true/false trivia:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete true/false trivia entry" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
