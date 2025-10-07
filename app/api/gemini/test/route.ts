// This file handles the API route for checking the connection to the Gemini API.
// It's a serverless function that's part of the Next.js API.

import { NextRequest, NextResponse } from 'next/server';
import { testGeminiConnection } from '@/lib/gemini';

/**
 * Handles POST requests to test the Gemini API connection.
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {NextResponse} - A JSON response indicating success or failure.
 */
export async function POST(request: NextRequest) {
  try {
    // Attempt to connect to the Gemini API using the utility function.
    const result = await testGeminiConnection();

    // If successful, return a JSON response with the result from the utility function.
    return NextResponse.json(result);
  } catch (error) {
    // If an error occurs, catch it and return a structured JSON error response.
    // The HTTP status code is set to 500 (Internal Server Error).
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred while trying to connect to Gemini.',
      },
      { status: 500 }
    );
  }
}
