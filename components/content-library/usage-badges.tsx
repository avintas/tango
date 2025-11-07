"use client";

import { getBadgeConfig } from "@/config/content-badges";
import type { BadgeConfig } from "@/config/content-badges";

interface UsageBadgesProps {
  usedFor?: string[];
  className?: string;
}

/**
 * UsageBadges Component
 * Displays badges showing which content types have been created from source content
 */
export function UsageBadges({ usedFor, className = "" }: UsageBadgesProps) {
  if (!usedFor || usedFor.length === 0) {
    return null;
  }

  const badges = getBadgeConfig(usedFor);

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {badges.map((badge: BadgeConfig) => (
        <span
          key={badge.key}
          className={`px-1.5 py-0.5 text-xs font-medium rounded ${badge.bgColor} ${badge.textColor}`}
          title={badge.title}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
