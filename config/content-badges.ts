/**
 * Content Badge Configuration
 * Centralized badge definitions for all content types
 */

export interface BadgeConfig {
  key: string;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  title: string;
}

export const CONTENT_BADGES: Record<string, BadgeConfig> = {
  mc: {
    key: "mc",
    label: "MC",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    title: "Used for Multiple Choice trivia",
  },
  "multiple-choice": {
    key: "multiple-choice",
    label: "MC",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    title: "Used for Multiple Choice trivia",
  },
  tf: {
    key: "tf",
    label: "TF",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    title: "Used for True/False trivia",
  },
  "true-false": {
    key: "true-false",
    label: "TF",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    title: "Used for True/False trivia",
  },
  whoami: {
    key: "whoami",
    label: "WAI",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    title: "Used for Who Am I? trivia",
  },
  "who-am-i": {
    key: "who-am-i",
    label: "WAI",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    title: "Used for Who Am I? trivia",
  },
  stats: {
    key: "stats",
    label: "S",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    title: "Used for Statistics content",
  },
  statistic: {
    key: "statistic",
    label: "S",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    title: "Used for Statistics content",
  },
  motivational: {
    key: "motivational",
    label: "M",
    color: "pink",
    bgColor: "bg-pink-100",
    textColor: "text-pink-800",
    title: "Used for Motivational content",
  },
  greetings: {
    key: "greetings",
    label: "G",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    title: "Used for Greetings content",
  },
  greeting: {
    key: "greeting",
    label: "G",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    title: "Used for Greetings content",
  },
  wisdom: {
    key: "wisdom",
    label: "W",
    color: "cyan",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-800",
    title: "Used for Wisdom content",
  },
  pbp: {
    key: "pbp",
    label: "P",
    color: "indigo",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-800",
    title: "Used for Penalty Box Philosopher content",
  },
  "penalty-box-philosopher": {
    key: "penalty-box-philosopher",
    label: "P",
    color: "indigo",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-800",
    title: "Used for Penalty Box Philosopher content",
  },
};

/**
 * Get badge configurations for a list of usage types
 * @param usedFor Array of content usage types
 * @returns Array of badge configurations
 */
export const getBadgeConfig = (usedFor?: string[]): BadgeConfig[] => {
  if (!usedFor || usedFor.length === 0) return [];
  return usedFor.map((key) => CONTENT_BADGES[key]).filter(Boolean);
};

/**
 * Get all available badge configurations
 * @returns Array of all badge configurations
 */
export const getAllBadges = (): BadgeConfig[] => {
  return Object.values(CONTENT_BADGES);
};

/**
 * Check if a badge key is valid
 * @param key Badge key to check
 * @returns true if the key is valid
 */
export const isValidBadgeKey = (key: string): boolean => {
  return key in CONTENT_BADGES;
};
