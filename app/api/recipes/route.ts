import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  Recipe,
  RecipeCreateInput,
  RecipeApiResponse,
  RecipeQueryParams,
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

// =============================================================================
// GET /api/recipes
// =============================================================================
// List/filter recipes
// Query params: limit, offset, category, theme, bagType, executionMode
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Filters
    const category = searchParams.get("category");
    const theme = searchParams.get("theme");
    const bagType = searchParams.get("bagType");
    const executionMode = searchParams.get("executionMode");

    // Build query
    let query = supabaseAdmin
      .from("trivia_sets_recipes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }

    if (theme) {
      query = query.eq("theme", theme);
    }

    if (bagType) {
      query = query.eq("bag_type", bagType);
    }

    if (executionMode) {
      query = query.eq("execution_mode", executionMode);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching recipes:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch recipes",
        } as RecipeApiResponse,
        { status: 500 },
      );
    }

    // Transform database records to Recipe interface
    const recipes: Recipe[] = (data || []).map((row: any) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: recipes,
      count: count || 0,
    } as RecipeApiResponse);
  } catch (error) {
    console.error("Error in GET /api/recipes:", error);
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
// POST /api/recipes
// =============================================================================
// Create new recipe
// Body: RecipeCreateInput
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: RecipeCreateInput = await request.json();

    // Validate input
    const validation = validateRecipeInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${validation.errors.join(", ")}`,
        } as RecipeApiResponse,
        { status: 400 },
      );
    }

    // Auto-determine bag type if not provided
    const bagType = body.bagType || determineBagType(body.questionTypes);

    // Prepare record for insertion
    const record = {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      category: body.category.trim(),
      theme: body.theme?.trim() || null,
      question_types: body.questionTypes,
      bag_type: bagType,
      quantity_min: body.quantity.min,
      quantity_max: body.quantity.max,
      quantity_default: body.quantity.default,
      cooldown_days: body.cooldown.days,
      cooldown_enabled: body.cooldown.enabled,
      selection_method: body.selectionMethod || "random",
      execution_mode: body.executionMode || "auto",
      created_by: body.createdBy || null,
    };

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from("trivia_sets_recipes")
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error("Error creating recipe:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create recipe",
        } as RecipeApiResponse,
        { status: 500 },
      );
    }

    // Transform database record to Recipe interface
    const recipe: Recipe = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      theme: data.theme,
      questionTypes: data.question_types || [],
      bagType: data.bag_type,
      quantity: {
        min: data.quantity_min,
        max: data.quantity_max,
        default: data.quantity_default,
      },
      cooldown: {
        days: data.cooldown_days,
        enabled: data.cooldown_enabled,
      },
      selectionMethod: data.selection_method || "random",
      executionMode: data.execution_mode || "auto",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      usageCount: data.usage_count || 0,
      lastUsedAt: data.last_used_at,
    };

    return NextResponse.json(
      {
        success: true,
        data: recipe,
      } as RecipeApiResponse,
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in POST /api/recipes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as RecipeApiResponse,
      { status: 500 },
    );
  }
}
