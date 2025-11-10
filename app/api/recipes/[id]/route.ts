import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  Recipe,
  RecipeUpdateInput,
  RecipeApiResponse,
  validateRecipeInput,
  determineBagType,
} from "@/lib/recipes/types";

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

// Helper function to transform database row to Recipe
function transformRecipe(row: any): Recipe {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    theme: row.theme,
    questionTypes: row.question_types || [],
    bagType: row.bag_type,
    quantity: {
      min: row.quantity_min,
      max: row.quantity_max,
      default: row.quantity_default,
    },
    cooldown: {
      days: row.cooldown_days,
      enabled: row.cooldown_enabled,
    },
    selectionMethod: row.selection_method || "random",
    executionMode: row.execution_mode || "auto",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    usageCount: row.usage_count || 0,
    lastUsedAt: row.last_used_at,
  };
}

// =============================================================================
// GET /api/recipes/[id]
// =============================================================================
// Get single recipe by ID
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        } as RecipeApiResponse,
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("trivia_sets_recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipe not found",
        } as RecipeApiResponse,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: transformRecipe(data),
    } as RecipeApiResponse);
  } catch (error) {
    console.error("Error in GET /api/recipes/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as RecipeApiResponse,
      { status: 500 },
    );
  }
}

// =============================================================================
// PUT /api/recipes/[id]
// =============================================================================
// Update recipe (full update)
// Body: RecipeUpdateInput
// =============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        } as RecipeApiResponse,
        { status: 400 },
      );
    }

    const body: RecipeUpdateInput = await request.json();

    // Get existing recipe to merge with updates
    const { data: existing } = await supabaseAdmin
      .from("trivia_sets_recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipe not found",
        } as RecipeApiResponse,
        { status: 404 },
      );
    }

    // Merge existing with updates
    const merged: RecipeUpdateInput = {
      name: body.name ?? existing.name,
      description:
        body.description !== undefined
          ? body.description
          : existing.description,
      category: body.category ?? existing.category,
      theme: body.theme !== undefined ? body.theme : existing.theme,
      questionTypes: body.questionTypes ?? existing.question_types,
      bagType: body.bagType ?? existing.bag_type,
      quantity: body.quantity ?? {
        min: existing.quantity_min,
        max: existing.quantity_max,
        default: existing.quantity_default,
      },
      cooldown: body.cooldown ?? {
        days: existing.cooldown_days,
        enabled: existing.cooldown_enabled,
      },
      selectionMethod: body.selectionMethod ?? existing.selection_method,
      executionMode: body.executionMode ?? existing.execution_mode,
    };

    // Validate merged input
    const validation = validateRecipeInput(merged);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${validation.errors.join(", ")}`,
        } as RecipeApiResponse,
        { status: 400 },
      );
    }

    // Auto-determine bag type if question types changed
    const bagType =
      body.questionTypes && body.questionTypes !== existing.question_types
        ? determineBagType(body.questionTypes)
        : merged.bagType;

    // Prepare update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.description !== undefined)
      updates.description = body.description?.trim() || null;
    if (body.category !== undefined) updates.category = body.category.trim();
    if (body.theme !== undefined) updates.theme = body.theme?.trim() || null;
    if (body.questionTypes !== undefined)
      updates.question_types = body.questionTypes;
    if (body.bagType !== undefined || body.questionTypes !== undefined)
      updates.bag_type = bagType;
    if (body.quantity !== undefined) {
      updates.quantity_min = body.quantity.min;
      updates.quantity_max = body.quantity.max;
      updates.quantity_default = body.quantity.default;
    }
    if (body.cooldown !== undefined) {
      updates.cooldown_days = body.cooldown.days;
      updates.cooldown_enabled = body.cooldown.enabled;
    }
    if (body.selectionMethod !== undefined)
      updates.selection_method = body.selectionMethod;
    if (body.executionMode !== undefined)
      updates.execution_mode = body.executionMode;

    // Update in database
    const { data, error } = await supabaseAdmin
      .from("trivia_sets_recipes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating recipe:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update recipe",
        } as RecipeApiResponse,
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: transformRecipe(data),
    } as RecipeApiResponse);
  } catch (error) {
    console.error("Error in PUT /api/recipes/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as RecipeApiResponse,
      { status: 500 },
    );
  }
}

// =============================================================================
// DELETE /api/recipes/[id]
// =============================================================================
// Delete recipe
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        } as RecipeApiResponse,
        { status: 400 },
      );
    }

    // Check if recipe exists
    const { data: existing } = await supabaseAdmin
      .from("trivia_sets_recipes")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipe not found",
        } as RecipeApiResponse,
        { status: 404 },
      );
    }

    // Delete recipe
    const { error } = await supabaseAdmin
      .from("trivia_sets_recipes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting recipe:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete recipe",
        } as RecipeApiResponse,
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    } as RecipeApiResponse);
  } catch (error) {
    console.error("Error in DELETE /api/recipes/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as RecipeApiResponse,
      { status: 500 },
    );
  }
}
