import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  CreateAIExtractionPrompt,
  UpdateAIExtractionPrompt,
} from "@/lib/supabase";

/**
 * GET /api/ai-extraction-prompts
 * Get all AI extraction prompts (optionally filtered by type)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promptType = searchParams.get("prompt_type");
    const isActive = searchParams.get("is_active");

    let query = supabaseAdmin
      .from("ai_extraction_prompts")
      .select("*")
      .order("created_at", { ascending: false });

    if (promptType) {
      query = query.eq("prompt_type", promptType);
    }

    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true");
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error fetching AI extraction prompts:", error);
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
 * POST /api/ai-extraction-prompts
 * Create new AI extraction prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateAIExtractionPrompt = await request.json();
    const { prompt_name, prompt_type, prompt_content, description, is_active } =
      body;

    if (!prompt_name?.trim() || !prompt_type || !prompt_content?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "prompt_name, prompt_type, and prompt_content are required",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("ai_extraction_prompts")
      .insert({
        prompt_name: prompt_name.trim(),
        prompt_type,
        prompt_content: prompt_content.trim(),
        description: description?.trim(),
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Prompt created successfully",
    });
  } catch (error) {
    console.error("Error creating AI extraction prompt:", error);
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
 * PATCH /api/ai-extraction-prompts
 * Update existing AI extraction prompt
 */
export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateAIExtractionPrompt & { id: number } =
      await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "id is required",
        },
        { status: 400 },
      );
    }

    const updateData: Partial<UpdateAIExtractionPrompt> = {};
    if (updates.prompt_name !== undefined) {
      updateData.prompt_name = updates.prompt_name.trim();
    }
    if (updates.prompt_type !== undefined) {
      updateData.prompt_type = updates.prompt_type;
    }
    if (updates.prompt_content !== undefined) {
      updateData.prompt_content = updates.prompt_content.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim();
    }
    if (updates.is_active !== undefined) {
      updateData.is_active = updates.is_active;
    }

    const { data, error } = await supabaseAdmin
      .from("ai_extraction_prompts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Prompt updated successfully",
    });
  } catch (error) {
    console.error("Error updating AI extraction prompt:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
