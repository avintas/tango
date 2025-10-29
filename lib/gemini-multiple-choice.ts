import { gemini } from "@/lib/gemini";
import { TriviaQuestion } from "./content-types"; // Assuming TriviaQuestion will be defined here or similar
import { extractJsonObject } from "./content-helpers"; // Re-using the helper

export interface MultipleChoiceGenerationRequest {
  sourceContent: string;
  customPrompt: string;
}

export interface MultipleChoiceGenerationResponse {
  success: boolean;
  data?: TriviaQuestion[];
  error?: string;
}

export async function generateMultipleChoice(
  request: MultipleChoiceGenerationRequest,
): Promise<MultipleChoiceGenerationResponse> {
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
    });

    const text = result.text;
    if (!text) {
      return { success: false, error: "Gemini returned an empty response." };
    }

    const parsedResponse = extractJsonObject(text);
    if (!parsedResponse || !Array.isArray(parsedResponse.items)) {
      return {
        success: false,
        error:
          'The AI returned an invalid format or was missing the "items" array.',
      };
    }

    const finalData: TriviaQuestion[] = parsedResponse.items.map(
      (item: any) => ({
        question_type: "multiple-choice",
        question_text: item.question_text || "",
        correct_answer: item.correct_answer || "",
        wrong_answers: item.wrong_answers || [],
        explanation: item.explanation || "",
        theme: item.theme || "",
      }),
    );

    return {
      success: true,
      data: finalData,
    };
  } catch (error) {
    console.error("❌ Error generating multiple choice questions:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
