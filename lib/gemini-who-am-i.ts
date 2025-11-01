import { gemini } from "@/lib/gemini";
import { TriviaQuestion } from "./types";
import { cleanJsonString } from "./content-helpers";

export interface WhoAmIGenerationRequest {
  sourceContent: string;
  customPrompt: string;
}

export interface WhoAmIGenerationResponse {
  success: boolean;
  data?: TriviaQuestion[];
  error?: string;
}

export async function generateWhoAmI(
  request: WhoAmIGenerationRequest,
): Promise<WhoAmIGenerationResponse> {
  try {
    const { sourceContent, customPrompt } = request;

    if (!sourceContent?.trim() || !customPrompt?.trim()) {
      return {
        success: false,
        error: "Source content and prompt are required.",
      };
    }

    const result = await gemini.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [
            { text: customPrompt + "\n\nSource Content:\n" + sourceContent },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = result.text;
    if (!text) {
      return { success: false, error: "Gemini returned an empty response." };
    }

    const cleanText = cleanJsonString(text);
    const parsedResponse = JSON.parse(cleanText);
    if (!parsedResponse || !Array.isArray(parsedResponse.items)) {
      return {
        success: false,
        error:
          'The AI returned an invalid format or was missing the "items" array.',
      };
    }

    const finalData: TriviaQuestion[] = parsedResponse.items.map(
      (item: any) => ({
        question_type: "who-am-i",
        question_text: item.question_text || "",
        correct_answer: item.correct_answer || "",
        wrong_answers: [], // Always empty for Who Am I
        explanation: item.explanation || "",
        theme: item.theme || "",
      }),
    );

    return {
      success: true,
      data: finalData,
    };
  } catch (error) {
    console.error("❌ Error generating who am I questions:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
