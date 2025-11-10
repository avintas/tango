import { NextRequest, NextResponse } from "next/server";
import {
  getAvailableThemes,
  getCategoriesForTheme,
  getAllTags,
  getContentCountsByTheme,
  getQuestionCountsByThemeCategory,
  searchContent,
} from "@/ideation/lib/exploration";
import type { ExplorationFilters } from "@/ideation/lib/types";

/**
 * GET /api/ideation/explore
 * Get exploration data (themes, categories, tags, counts)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "themes": {
        const themes = await getAvailableThemes();
        return NextResponse.json({ success: true, data: themes });
      }

      case "categories": {
        const theme = searchParams.get("theme");
        if (!theme) {
          return NextResponse.json(
            { success: false, error: "Theme parameter is required" },
            { status: 400 },
          );
        }
        const categories = await getCategoriesForTheme(theme);
        return NextResponse.json({ success: true, data: categories });
      }

      case "tags": {
        const tags = await getAllTags();
        return NextResponse.json({ success: true, data: tags });
      }

      case "content-counts": {
        const counts = await getContentCountsByTheme();
        return NextResponse.json({ success: true, data: counts });
      }

      case "question-counts": {
        const counts = await getQuestionCountsByThemeCategory();
        return NextResponse.json({ success: true, data: counts });
      }

      case "search": {
        const filters: ExplorationFilters = {};
        const themes = searchParams.get("themes");
        const categories = searchParams.get("categories");
        const tags = searchParams.get("tags");
        const hasUsage = searchParams.get("hasUsage");
        const usageTypes = searchParams.get("usageTypes");

        if (themes) filters.themes = themes.split(",");
        if (categories) filters.categories = categories.split(",");
        if (tags) filters.tags = tags.split(",");
        if (hasUsage !== null) filters.hasUsage = hasUsage === "true";
        if (usageTypes) filters.usageTypes = usageTypes.split(",");

        const results = await searchContent(filters);
        return NextResponse.json({ success: true, data: results });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error in ideation explore API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
