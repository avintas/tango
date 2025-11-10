/**
 * Ideation Module - AI Analysis Functions
 * Uses Gemini to analyze multiple content records for patterns and insights
 */

import { gemini, handleGeminiError } from "@/gemini";
import { cleanJsonString } from "@/lib/content-helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AnalysisRequest, AnalysisResult } from "./types";

/**
 * Analyze multiple content records using Gemini
 */
export async function analyzeContent(
  request: AnalysisRequest,
): Promise<AnalysisResult> {
  try {
    const { contentIds, analysisType, prompt } = request;

    if (!contentIds || contentIds.length === 0) {
      return {
        success: false,
        error: "At least one content ID is required",
      };
    }

    // Fetch content records
    const { data: contentData, error: fetchError } = await supabaseAdmin
      .from("source_content_ingested")
      .select("*")
      .in("id", contentIds);

    if (fetchError) {
      throw new Error(`Failed to fetch content: ${fetchError.message}`);
    }

    if (!contentData || contentData.length === 0) {
      return {
        success: false,
        error: "No content found for the provided IDs",
      };
    }

    // Build analysis prompt based on type
    const analysisPrompt = buildAnalysisPrompt(
      analysisType,
      contentData,
      prompt,
    );

    // Call Gemini API
    const result = await gemini.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [{ text: analysisPrompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = result.text;
    if (!text) {
      return {
        success: false,
        error: "Gemini returned empty response",
      };
    }

    // Parse and clean JSON response
    const cleanText = cleanJsonString(text);
    const parsedResponse = JSON.parse(cleanText);

    return {
      success: true,
      insights: parsedResponse.insights || [],
      recommendations: parsedResponse.recommendations || [],
      patterns: parsedResponse.patterns,
      opportunities: parsedResponse.opportunities || [],
    };
  } catch (error) {
    const errorResult = handleGeminiError(error);
    return {
      success: false,
      error: errorResult.error,
    };
  }
}

/**
 * Build analysis prompt based on analysis type
 */
function buildAnalysisPrompt(
  analysisType: AnalysisRequest["analysisType"],
  contentData: any[],
  customPrompt?: string,
): string {
  const contentSummary = contentData
    .map(
      (item, idx) =>
        `Content ${idx + 1}:\n` +
        `- Title: ${item.title || "Untitled"}\n` +
        `- Theme: ${item.theme || "N/A"}\n` +
        `- Category: ${item.category || "N/A"}\n` +
        `- Tags: ${item.tags?.join(", ") || "None"}\n` +
        `- Summary: ${item.summary || "N/A"}\n` +
        `- Content Preview: ${item.content_text?.slice(0, 200) || "N/A"}...\n`,
    )
    .join("\n---\n\n");

  const basePrompts: Record<AnalysisRequest["analysisType"], string> = {
    "pattern-discovery": `Analyze the following content records and identify patterns, common themes, recurring topics, and connections between them. Provide insights about what content types could be created from these patterns.`,
    "content-synthesis": `Analyze these content records and suggest how they could be combined or synthesized to create new content. Identify complementary elements and opportunities for content generation.`,
    "quality-assessment": `Review these content records and assess their quality, completeness, and potential for generating trivia questions or other content types. Provide recommendations for improvement.`,
    "opportunity-identification": `Analyze these content records and identify opportunities for creating new content. What gaps exist? What content types would work well with this material?`,
  };

  const basePrompt = customPrompt || basePrompts[analysisType];

  return `${basePrompt}\n\nContent Records:\n\n${contentSummary}\n\nPlease provide your analysis in JSON format with the following structure:
{
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "patterns": {
    "theme": "common theme",
    "category": "common category",
    "tags": ["tag1", "tag2"],
    "commonElements": ["element1", "element2"]
  },
  "opportunities": [
    {
      "type": "content type",
      "description": "description",
      "priority": "high|medium|low"
    }
  ]
}`;
}
