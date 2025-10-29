import { NextRequest, NextResponse } from "next/server";
import { generateReadableTrivia } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { sourceContent, customPrompt } = await request.json();

    if (!sourceContent || !customPrompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Source content and custom prompt are required",
        },
        { status: 400 },
      );
    }

    // No questionType needed - user specifies format in their prompt
    const result = await generateReadableTrivia(
      sourceContent,
      customPrompt,
      "multiple-choice", // Default for backwards compatibility
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Trivia generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
