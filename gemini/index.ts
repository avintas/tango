/**
 * Gemini Module - Public API
 * Centralized exports for all Gemini-related functionality
 */

// Client
export { gemini } from "./lib/client";

// Error Handler
export { handleGeminiError } from "./lib/error-handler";

// Generators - Trivia
export {
  generateMultipleChoice,
  type MultipleChoiceGenerationRequest,
  type MultipleChoiceGenerationResponse,
} from "./lib/generators/multiple-choice";

export {
  generateTrueFalse,
  type TrueFalseGenerationRequest,
  type TrueFalseGenerationResponse,
} from "./lib/generators/true-false";

export {
  generateWhoAmI,
  type WhoAmIGenerationRequest,
  type WhoAmIGenerationResponse,
} from "./lib/generators/who-am-i";

// Generators - Collections
export {
  generateStatsContent,
  type StatsGenerationRequest,
  type StatsGenerationResponse,
} from "./lib/generators/stats";

export {
  generateMotivationalContent,
  type MotivationalGenerationRequest,
  type MotivationalGenerationResponse,
} from "./lib/generators/motivational";

export {
  generateGreetingsContent,
  type GreetingsGenerationRequest,
  type GreetingsGenerationResponse,
} from "./lib/generators/greetings";

export {
  generateWisdomContent,
  type WisdomGenerationRequest,
  type WisdomGenerationResponse,
} from "./lib/generators/wisdom";
