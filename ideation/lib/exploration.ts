/**
 * Ideation Module - Exploration Functions
 * Functions for exploring themes, tags, categories, and content availability
 */

import { supabaseAdmin } from "@/lib/supabase-admin";
import type { ExplorationFilters } from "./types";

/**
 * Get available themes from source content
 */
export async function getAvailableThemes(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("source_content_ingested")
      .select("theme")
      .not("theme", "is", null);

    if (error) throw error;

    const themes = [...new Set(data?.map((item) => item.theme) || [])];
    return themes.sort();
  } catch (error) {
    console.error("Error fetching themes:", error);
    return [];
  }
}

/**
 * Get available categories for a theme
 */
export async function getCategoriesForTheme(theme: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("source_content_ingested")
      .select("category")
      .eq("theme", theme)
      .not("category", "is", null);

    if (error) throw error;

    const categories = [...new Set(data?.map((item) => item.category) || [])];
    return categories.sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Get all unique tags from source content
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("source_content_ingested")
      .select("tags");

    if (error) throw error;

    const allTags = new Set<string>();
    data?.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

/**
 * Get content availability counts by theme
 */
export async function getContentCountsByTheme(): Promise<
  Record<string, number>
> {
  try {
    const { data, error } = await supabaseAdmin
      .from("source_content_ingested")
      .select("theme");

    if (error) throw error;

    const counts: Record<string, number> = {};
    data?.forEach((item) => {
      if (item.theme) {
        counts[item.theme] = (counts[item.theme] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    console.error("Error fetching content counts:", error);
    return {};
  }
}

/**
 * Get question counts by theme and category from trivia tables
 */
export async function getQuestionCountsByThemeCategory(): Promise<
  Record<string, Record<string, number>>
> {
  try {
    const [mcData, tfData, waiData] = await Promise.all([
      supabaseAdmin.from("trivia_multiple_choice").select("theme, category"),
      supabaseAdmin.from("trivia_true_false").select("theme, category"),
      supabaseAdmin.from("trivia_who_am_i").select("theme, category"),
    ]);

    const counts: Record<string, Record<string, number>> = {};

    const processData = (data: any[]) => {
      data?.forEach((item) => {
        if (item.theme) {
          if (!counts[item.theme]) {
            counts[item.theme] = {};
          }
          const category = item.category || "Uncategorized";
          counts[item.theme][category] =
            (counts[item.theme][category] || 0) + 1;
        }
      });
    };

    processData(mcData.data || []);
    processData(tfData.data || []);
    processData(waiData.data || []);

    return counts;
  } catch (error) {
    console.error("Error fetching question counts:", error);
    return {};
  }
}

/**
 * Search content with filters
 */
export async function searchContent(filters: ExplorationFilters) {
  try {
    let query = supabaseAdmin.from("source_content_ingested").select("*");

    if (filters.themes && filters.themes.length > 0) {
      query = query.in("theme", filters.themes);
    }

    if (filters.categories && filters.categories.length > 0) {
      query = query.in("category", filters.categories);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains("tags", filters.tags);
    }

    if (filters.hasUsage !== undefined) {
      if (filters.hasUsage) {
        query = query.not("used_for", "is", null);
      } else {
        query = query.is("used_for", null);
      }
    }

    if (filters.usageTypes && filters.usageTypes.length > 0) {
      query = query.overlaps("used_for", filters.usageTypes);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error searching content:", error);
    return [];
  }
}
