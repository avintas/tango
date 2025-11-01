"use client";

import {
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
  FaceSmileIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  SunIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { AcademicCapIcon } from "@heroicons/react/24/solid";
import { ContentType } from "@/lib/types";

// Re-export for components that still import from here
export type { ContentType };

interface ContentTypeSelectorProps {
  selectedType: ContentType | null;
  onTypeSelect: (type: ContentType) => void;
  allowedTypes?: ContentType[];
}

export const typeIcons: Record<ContentType, any> = {
  "multiple-choice": QuestionMarkCircleIcon,
  "true-false": CheckBadgeIcon,
  "who-am-i": FaceSmileIcon,
  stat: TrophyIcon,
  wisdom: SparklesIcon,
  motivational: SunIcon,
  greeting: ChatBubbleBottomCenterTextIcon,
};

export const typeNames: Record<ContentType, string> = {
  "multiple-choice": "Multiple Choice",
  "true-false": "True/False",
  "who-am-i": "Who Am I?",
  stat: "Stats",
  wisdom: "Wisdom",
  motivational: "Motivational",
  greeting: "Greetings",
};

export default function ContentTypeSelector({
  selectedType,
  onTypeSelect,
  allowedTypes = [],
}: ContentTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {allowedTypes.map((type) => {
        const Icon = typeIcons[type];
        return (
          <button
            key={type}
            onClick={() => onTypeSelect(type)}
            className={clsx(
              "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 text-xs transition-colors h-20 w-full text-center",
              selectedType === type
                ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="font-medium text-xs">{typeNames[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
