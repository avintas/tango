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

export type ContentType =
  | "multiple-choice"
  | "true-false"
  | "who-am-i"
  | "stats"
  | "wisdom"
  | "motivational"
  | "greetings"
  | "penalty-box-philosopher";

interface ContentTypeSelectorProps {
  selectedType: ContentType | null;
  onTypeSelect: (type: ContentType) => void;
  allowedTypes?: ContentType[];
}

export const typeIcons = {
  "multiple-choice": QuestionMarkCircleIcon,
  "true-false": CheckBadgeIcon,
  "who-am-i": FaceSmileIcon,
  stats: TrophyIcon,
  wisdom: SparklesIcon,
  motivational: SunIcon,
  greetings: ChatBubbleBottomCenterTextIcon,
  "penalty-box-philosopher": AcademicCapIcon,
};

export const typeNames = {
  "multiple-choice": "Multiple Choice",
  "true-false": "True/False",
  "who-am-i": "Who Am I?",
  stats: "Stats",
  wisdom: "Wisdom",
  motivational: "Motivational",
  greetings: "Greetings",
  "penalty-box-philosopher": "Penalty Box Philosopher",
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
