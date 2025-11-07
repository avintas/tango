// Builder-specific types for Build Trivia Set
// These types stay in this builder folder - NOT in core/types.ts

export interface TriviaSet {
  id: number; // BIGSERIAL = number (matches SQL)
  title: string;
  slug: string;
  description?: string;
  category?: string;
  theme?: string;
  tags: string[];
  difficulty?: "easy" | "medium" | "hard"; // Matches actual constraint
  question_data: TriviaQuestionData[];
  question_count: number; // Must be > 0 (has check constraint)
  status: "draft" | "scheduled" | "published"; // Matches actual constraint
  visibility: "Public" | "Unlisted" | "Private"; // Matches actual constraint, defaults to 'Private'
  published_at?: string; // TIMESTAMPTZ
  scheduled_for?: string; // TIMESTAMPTZ (required if status='scheduled')
  created_at: string;
  updated_at: string;
}

export interface TriviaQuestionData {
  question_id?: string;
  source_id?: number;
  question_text: string;
  question_type: "multiple-choice" | "true-false" | "who-am-i";
  correct_answer: string;
  wrong_answers: string[];
  explanation?: string;
  tags?: string[];
  difficulty?: number;
  points?: number;
  time_limit?: number;
}

export interface QuestionCandidate {
  id: number;
  question_text: string;
  question_type: "multiple-choice" | "true-false" | "who-am-i";
  correct_answer: string;
  wrong_answers?: string[];
  is_true?: boolean; // For true/false questions
  explanation?: string;
  theme?: string;
  tags?: string[];
  difficulty?: string;
  source_table:
    | "trivia_multiple_choice"
    | "trivia_true_false"
    | "trivia_who_am_i";
  relevance_score?: number;
}

export interface QuestionSelectionResult {
  candidates: QuestionCandidate[];
  selected: QuestionCandidate[];
  distribution: {
    tmc: number;
    tft: number;
    wai?: number;
  };
}

export interface TriviaSetMetadata {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  theme?: string;
  tags: string[];
  difficulty?: string;
  estimated_duration?: number;
  sub_themes?: string[];
  quality_score?: number;
  diversity_score?: number;
}
