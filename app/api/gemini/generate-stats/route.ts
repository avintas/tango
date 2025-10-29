import { NextResponse } from "next/server";
import { generateStatsContent } from "@/lib/gemini-stats";
import { UniContent } from "@/lib/content-types";

/**
 * Formats structured stats content into a readable string for UI display.
 * @param data An array of UniContent objects.
 * @returns A single string with items separated by '---'.
 */
function formatContentForDisplay(data: UniContent[]): string {
  if (!data || data.length === 0) {
    return "No content generated.";
  }

  // Combine the different fields into a readable block for each item.
  return data
    .map((item) => {
      let block = `**Stat:** ${item.content_text}`;
      if (item.category) {
        block += `\n**Category:** ${item.category}`;
      }
      if (item.theme) {
        block += `\n**Theme:** ${item.theme}`;
      }
      return block;
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

    const result = await generateStatsContent({
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
