/**
 * Ideation Module - Core Types
 * Defines types for ideation plans, selections, and analysis results
 */

import { ContentType } from "@/components/content-type-selector";

/**
 * Content Selection Types
 */
export type SelectionType = "source-content" | "trivia-questions";

export interface ContentSelection {
  id: number;
  type: SelectionType;
  contentId: number;
  metadata?: {
    theme?: string;
    category?: string;
    tags?: string[];
    title?: string;
  };
}

/**
 * Plan Types
 */
export type PlanType =
  | "content-selection"
  | "question-selection"
  | "analysis-driven"
  | "theme-based"
  | "batch-generation";

export interface PlanParameters {
  theme?: string;
  category?: string;
  tags?: string[];
  contentTypes?: ContentType[];
  questionCount?: number;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  targetAudience?: string;
  scheduling?: {
    startDate?: string;
    frequency?: "daily" | "weekly" | "monthly";
    duration?: number;
  };
}

export interface PlanMetadata {
  createdAt: string;
  createdBy?: string;
  description?: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
}

export interface IdeationPlan {
  id: string;
  type: PlanType;
  selections: ContentSelection[];
  parameters: PlanParameters;
  metadata: PlanMetadata;
}

/**
 * Analysis Result Types
 */
export interface AnalysisRequest {
  contentIds: number[];
  analysisType:
    | "pattern-discovery"
    | "content-synthesis"
    | "quality-assessment"
    | "opportunity-identification";
  prompt?: string;
}

export interface AnalysisResult {
  success: boolean;
  insights?: string[];
  recommendations?: string[];
  patterns?: {
    theme?: string;
    category?: string;
    tags?: string[];
    commonElements?: string[];
  };
  opportunities?: {
    type: string;
    description: string;
    priority: "low" | "medium" | "high";
  }[];
  error?: string;
}

/**
 * Exploration Filter Types
 */
export interface ExplorationFilters {
  themes?: string[];
  categories?: string[];
  tags?: string[];
  contentTypes?: ContentType[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  hasUsage?: boolean;
  usageTypes?: string[];
}
