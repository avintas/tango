/**
 * Unified Content System - Helper Functions
 * Convenience functions for working with unified content
 */

import { UniContent, TriviaQuestion } from "./content-types";
import { gemini } from "@/lib/gemini";

export function extractJsonObject(text: string): any | null {
  try {
    const jsonStartIndex = text.indexOf("{");
    const jsonEndIndex = text.lastIndexOf("}");
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      console.error("No JSON object found in the response.");
      return null;
    }
    const jsonString = text.substring(jsonStartIndex, jsonEndIndex + 1);
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", text);
    return null;
  }
}

/**
 * Save content to the unified content table via API
 * @param content Content to save
 * @returns Saved content or error
 */
export async function saveUniContent(
  content: UniContent,
): Promise<{ success: boolean; data?: UniContent; error?: string }> {
  try {
    const response = await fetch("/api/content/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetch content with optional filters
 * @param filters Optional filters
 * @returns Array of content
 */
export async function fetchUniContent(filters?: {
  content_type?: UniContent["content_type"];
  source_content_id?: number;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: UniContent[];
  total?: number;
  error?: string;
}> {
  try {
    const params = new URLSearchParams();

    if (filters?.content_type)
      params.append("content_type", filters.content_type);
    if (filters?.source_content_id)
      params.append("source_content_id", filters.source_content_id.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const response = await fetch(`/api/uni-content?${params.toString()}`);
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update existing content
 * @param id Content ID
 * @param updates Fields to update
 * @returns Updated content or error
 */
export async function updateUniContent(
  id: number,
  updates: Partial<
    Omit<
      UniContent,
      "id" | "content_type" | "source_content_id" | "created_at" | "updated_at"
    >
  >,
): Promise<{ success: boolean; data?: UniContent; error?: string }> {
  try {
    const response = await fetch(`/api/uni-content/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: { id, ...updates } }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete content by ID
 * @param id Content ID
 * @returns Success status
 */
export async function deleteUniContent(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/uni-content/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark content as used in a location
 * @param id Content ID
 * @param location Location identifier (e.g., 'email', 'social', 'app')
 * @returns Success status
 */
export async function markContentAsUsed(
  id: number,
  location: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch current content
    const response = await fetch(`/api/uni-content?content_type=&limit=1000`);
    const result = await response.json();

    if (!result.success || !result.data) {
      return { success: false, error: "Failed to fetch content" };
    }

    const content = result.data.find((c: UniContent) => c.id === id);

    if (!content) {
      return { success: false, error: "Content not found" };
    }

    // Add location to used_in array if not already present
    const used_in = content.used_in || [];
    if (!used_in.includes(location)) {
      used_in.push(location);
    }

    // Update content
    return await updateUniContent(id, { used_in });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch save multiple content items
 * @param contents Array of content to save
 * @returns Array of results
 */
export async function batchSaveUniContent(
  contents: UniContent[],
): Promise<Array<{ success: boolean; data?: UniContent; error?: string }>> {
  const results = await Promise.all(
    contents.map((content) => saveUniContent(content)),
  );
  return results;
}
