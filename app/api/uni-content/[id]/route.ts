import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import {
  UniContent,
  UpdateContentRequest,
  UpdateContentResponse,
  DeleteContentResponse,
} from "@/lib/content-types";

/**
 * PUT /api/uni-content/[id]
 * Update existing content
 */
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
          error: "Invalid content ID",
        } as UpdateContentResponse,
        { status: 400 },
      );
    }

    const body: UpdateContentRequest = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: "Content data is required",
        } as UpdateContentResponse,
        { status: 400 },
      );
    }

    console.log(`✏️ Updating content ID ${id}...`);

    // Build update object (only include provided fields)
    const updateData: Record<string, any> = {};

    if (content.content_text !== undefined) {
      if (!content.content_text?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Content text cannot be empty",
          } as UpdateContentResponse,
          { status: 400 },
        );
      }
      updateData.content_text = content.content_text.trim();
    }

    if (content.used_in !== undefined) updateData.used_in = content.used_in;
    if (content.theme !== undefined) updateData.theme = content.theme;
    if (content.attribution !== undefined)
      updateData.attribution = content.attribution;
    if (content.category !== undefined) updateData.category = content.category;

    // Update in database
    const { data, error } = await supabaseAdmin
      .from("content")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Content not found",
        } as UpdateContentResponse,
        { status: 404 },
      );
    }

    console.log(`✅ Content ID ${id} updated successfully`);

    return NextResponse.json({
      success: true,
      data,
    } as UpdateContentResponse);
  } catch (error) {
    console.error("❌ Error updating content:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      } as UpdateContentResponse,
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/uni-content/[id]
 * Update content status (archive/unarchive)
 */
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
          error: "Invalid content ID",
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: "Status is required",
        },
        { status: 400 },
      );
    }

    console.log(`📦 Updating content ID ${id} status to: ${status}`);

    const { data, error } = await supabaseAdmin
      .from("content")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Content not found",
        },
        { status: 404 },
      );
    }

    console.log(`✅ Content ID ${id} status updated successfully`);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ Error updating content status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/uni-content/[id]
 * Delete content by ID
 */
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
          error: "Invalid content ID",
        } as DeleteContentResponse,
        { status: 400 },
      );
    }

    console.log(`🗑️ Deleting content ID ${id}...`);

    const { error } = await supabaseAdmin.from("content").delete().eq("id", id);

    if (error) {
      console.error("❌ Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`✅ Content ID ${id} deleted successfully`);

    return NextResponse.json({
      success: true,
    } as DeleteContentResponse);
  } catch (error) {
    console.error("❌ Error deleting content:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      } as DeleteContentResponse,
      { status: 500 },
    );
  }
}
