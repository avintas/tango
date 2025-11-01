import { NextResponse } from "next/server";
import { generateGreetingsContent } from "@/lib/gemini-greetings";
import { CollectionContent } from "@/lib/types";

/**
 * Formats the structured CollectionContent data into a human-readable string for display.
 * @param data Array of CollectionContent items.
 * @returns A formatted string.
 */
function formatContentForDisplay(data: CollectionContent[]): string {
  if (!data || data.length === 0) {
    return "No content generated.";
  }

  return data.map((item) => item.content_text).join("\n\n---\n\n");
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

    const result = await generateGreetingsContent({
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
