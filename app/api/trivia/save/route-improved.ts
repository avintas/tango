import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface ParsedQuestion {
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  question_type: string;
}

/**
 * Detect question type from content before parsing
 */
function detectQuestionType(
  content: string,
): "who-am-i" | "true-false" | "multiple-choice" {
  const firstBlock = content.split("---")[0]?.toLowerCase() || "";

  // Check for "Who Am I" patterns in the first question
  const hasWhoAmIPattern =
    /\*\*question \d+:\*\*\s*(i am |i'm |i represent )/i.test(content) ||
    /question \d+:\s*(i am |i'm |i represent )/i.test(content);

  if (hasWhoAmIPattern) {
    return "who-am-i";
  }

  // Check for True/False pattern (Answer: True/False without options)
  const hasTrueFalsePattern =
    /\*\*answer:\*\*\s*(true|false)/i.test(content) &&
    !/^[A-D]\)/m.test(content); // No A) B) C) D) options

  if (hasTrueFalsePattern) {
    return "true-false";
  }

  // Default to multiple choice
  return "multiple-choice";
}

/**
 * Parse multiple-choice questions from Markdown
 */
function parseMultipleChoice(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const questionBlocks = content.split("---").filter((block) => block.trim());

  for (const block of questionBlocks) {
    const lines = block
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    let question = "";
    let correctAnswer = "";
    const options: { [key: string]: string } = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Extract question
      if (line.startsWith("**Question")) {
        question = line.replace(/\*\*Question \d+:\*\*/, "").trim();
      }

      // Extract options (A, B, C, D)
      const optionMatch = line.match(/^([A-D])\)\s*(.+)$/);
      if (optionMatch) {
        options[optionMatch[1]] = optionMatch[2].trim();
      }

      // Extract correct answer
      if (line.startsWith("**Correct Answer:**")) {
        correctAnswer = line
          .replace("**Correct Answer:**", "")
          .trim()
          .toUpperCase();
      }
    }

    // Build the question object
    if (question && correctAnswer && Object.keys(options).length === 4) {
      const correctText = options[correctAnswer];
      const wrongAnswers = Object.entries(options)
        .filter(([key]) => key !== correctAnswer)
        .map(([, value]) => value);

      if (correctText && wrongAnswers.length === 3) {
        questions.push({
          question,
          correct_answer: correctText,
          wrong_answers: wrongAnswers,
          question_type: "multiple-choice",
        });
      }
    }
  }

  return questions;
}

/**
 * Parse true/false questions from Markdown
 */
function parseTrueFalse(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const questionBlocks = content.split("---").filter((block) => block.trim());

  for (const block of questionBlocks) {
    const lines = block
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    let question = "";
    let answer = "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Extract question
      if (trimmed.startsWith("**Question")) {
        question = trimmed.replace(/\*\*Question \d+:\*\*/, "").trim();
      }

      // Extract answer
      if (trimmed.startsWith("**Answer:**")) {
        answer = trimmed.replace("**Answer:**", "").trim().toLowerCase();
      }
    }

    if (question && (answer === "true" || answer === "false")) {
      const correctAnswer = answer === "true" ? "True" : "False";
      const wrongAnswer = answer === "true" ? "False" : "True";

      questions.push({
        question,
        correct_answer: correctAnswer,
        wrong_answers: [wrongAnswer],
        question_type: "true-false",
      });
    }
  }

  return questions;
}

/**
 * Parse who-am-i questions from Markdown
 * ENHANCED: Can handle both formats (with and without options)
 */
function parseWhoAmI(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const questionBlocks = content.split("---").filter((block) => block.trim());

  for (const block of questionBlocks) {
    const lines = block
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    let question = "";
    let answer = "";
    const options: { [key: string]: string } = {};
    let correctAnswerKey = "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Extract question
      if (trimmed.startsWith("**Question")) {
        question = trimmed.replace(/\*\*Question \d+:\*\*/, "").trim();
      }

      // Extract options if present (A, B, C, D)
      const optionMatch = trimmed.match(/^([A-D])\)\s*(.+)$/);
      if (optionMatch) {
        options[optionMatch[1]] = optionMatch[2].trim();
      }

      // Extract answer - could be direct text or letter reference
      if (trimmed.startsWith("**Answer:**")) {
        answer = trimmed.replace("**Answer:**", "").trim();
      } else if (trimmed.startsWith("**Correct Answer:**")) {
        const extracted = trimmed
          .replace("**Correct Answer:**", "")
          .trim()
          .toUpperCase();

        // If it's a letter (A, B, C, D), it's referencing an option
        if (/^[A-D]$/.test(extracted) && Object.keys(options).length > 0) {
          correctAnswerKey = extracted;
          answer = options[extracted] || "";
        } else {
          answer = extracted;
        }
      }
    }

    // If we have options and a letter key, get the actual answer text
    if (correctAnswerKey && options[correctAnswerKey]) {
      answer = options[correctAnswerKey];
    }

    if (question && answer) {
      questions.push({
        question,
        correct_answer: answer,
        wrong_answers: [], // Who Am I questions don't need wrong answers
        question_type: "who-am-i",
      });
    }
  }

  return questions;
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: "Content is required",
        },
        { status: 400 },
      );
    }

    // IMPROVED: Detect question type from content FIRST
    const detectedType = detectQuestionType(content);
    console.log("Detected question type:", detectedType);

    let parsedQuestions: ParsedQuestion[] = [];

    // Parse based on detected type
    switch (detectedType) {
      case "who-am-i":
        parsedQuestions = parseWhoAmI(content);
        break;
      case "true-false":
        parsedQuestions = parseTrueFalse(content);
        break;
      case "multiple-choice":
        parsedQuestions = parseMultipleChoice(content);
        break;
    }

    // Fallback: Try other parsers if primary fails
    if (parsedQuestions.length === 0) {
      console.log("Primary parser failed, trying fallbacks...");

      parsedQuestions = parseMultipleChoice(content);

      if (parsedQuestions.length === 0) {
        parsedQuestions = parseTrueFalse(content);
      }

      if (parsedQuestions.length === 0) {
        parsedQuestions = parseWhoAmI(content);
      }
    }

    if (parsedQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No valid questions found in the content. Please check the format.",
        },
        { status: 400 },
      );
    }

    // Save to database using admin client (bypasses RLS - correct for server-side)
    const { data, error } = await supabaseAdmin
      .from("trivia_questions")
      .insert(
        parsedQuestions.map((q) => ({
          question: q.question,
          correct_answer: q.correct_answer,
          wrong_answers: q.wrong_answers,
          question_type: q.question_type,
          status: "draft",
        })),
      )
      .select();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to save to database: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      count: parsedQuestions.length,
      questions: data,
      detectedType, // Return what type was detected for debugging
    });
  } catch (error) {
    console.error("Save trivia error:", error);

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
