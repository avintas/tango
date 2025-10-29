import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PUT /api/greetings/[id] - Update greeting entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.greeting_text !== undefined)
      updateData.greeting_text = body.greeting_text;
    if (body.attribution !== undefined)
      updateData.attribution = body.attribution;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.source_content_id !== undefined)
      updateData.source_content_id = body.source_content_id;
    if (body.used_in !== undefined) updateData.used_in = body.used_in;
    if (body.display_order !== undefined)
      updateData.display_order = body.display_order;
    if (body.published_at !== undefined)
      updateData.published_at = body.published_at;
    if (body.archived_at !== undefined)
      updateData.archived_at = body.archived_at;

    const { data, error } = await supabase
      .from("greetings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating greeting:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update greeting entry" },
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

// PATCH /api/greetings/[id] - Partially update greeting (archive/status changes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Handle archive status
    if (body.status === "archived" && !body.archived_at) {
      updateData.status = "archived";
      updateData.archived_at = new Date().toISOString();
    } else if (body.status) {
      updateData.status = body.status;
      if (body.status === "published" && !body.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from("greetings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error patching greeting:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update greeting status" },
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

// DELETE /api/greetings/[id] - Delete greeting entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10);

    const { error } = await supabase.from("greetings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting greeting:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete greeting entry" },
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
