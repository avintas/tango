import { NextResponse } from "next/server";
import { generateWisdomContent } from "@/gemini";
import { CollectionContent } from "@/lib/types";

/**
 * Formats structured wisdom content into a readable string for UI display.
 * @param data An array of CollectionContent objects.
 * @returns A single string with items separated by '---'.
 */
function formatContentForDisplay(data: CollectionContent[]): string {
  if (!data || data.length === 0) {
    return "No content generated.";
  }

  return data
    .map((item) => {
      let block = "";

      // Title
      if (item.content_title) {
        block += `**Title:** ${item.content_title}\n\n`;
      }

      // Musings
      if (item.musings) {
        block += `**Musings:** ${item.musings}\n\n`;
      }

      // From the Box
      if (item.from_the_box) {
        block += `**From the Box:** ${item.from_the_box}\n\n`;
      }

      // Fallback to content_text if no specific fields
      if (!item.musings && !item.from_the_box && item.content_text) {
        block += `${item.content_text}\n\n`;
      }

      // Theme
      if (item.theme) {
        block += `**Theme:** ${item.theme}\n\n`;
      }

      // Attribution
      if (item.attribution) {
        block += `**Attribution:** ${item.attribution}`;
      }

      return block.trim();
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
