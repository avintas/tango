import { NextResponse } from "next/server";
import { generateWisdomContent } from "@/lib/gemini-wisdom";
import { UniContent } from "@/lib/types";

/**
 * Formats structured wisdom content into a readable string for UI display.
 * @param data An array of UniContent objects.
 * @returns A single string with items separated by '---'.
 */
function formatContentForDisplay(data: UniContent[]): string {
  if (!data || data.length === 0) {
    return "No content generated.";
  }

  return data
    .map((item) => {
      const parts = [];
      if (item.content_title) {
        parts.push(`TITLE: ${item.content_title}`);
      }
      if (item.musings) {
        parts.push(`MUSING: "${item.musings}"`);
      }
      if (item.from_the_box) {
        parts.push(`FROM THE BOX: ${item.from_the_box}`);
      }
      // Fallback to content_text for legacy format
      if (!item.musings && !item.from_the_box && item.content_text) {
        parts.push(item.content_text);
      }
      return parts.join("\n\n");
    })
    .join("\n\n---\n\n");
}

export async function POST(req: Request) {
  try {
    const { sourceContent, customPrompt } = await req.json();

    if (!sourceContent || !customPrompt) {
      return NextResponse.json(
        { success: false, error: "Source content and prompt are required" },
        { status: 400 },
      );
    }

    const result = await generateWisdomContent({
      sourceContent,
      customPrompt,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || "Generation failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        generatedContentForDisplay: formatContentForDisplay(result.data),
        structuredDataForSaving: result.data,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
