"use client";

import {
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  TrophyIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

export type Theme =
  | "Players"
  | "Teams & Organizations"
  | "Venues & Locations"
  | "Awards & Honors"
  | "Leadership & Staff";

interface ThemeSelectorProps {
  selectedTheme: Theme | null;
  onThemeSelect: (theme: Theme) => void;
}

const themes: Array<{
  value: Theme;
  label: string;
  icon: typeof UserIcon;
  color: string;
}> = [
  {
    value: "Players",
    label: "Players",
    icon: UserIcon,
    color: "indigo",
  },
  {
    value: "Teams & Organizations",
    label: "Teams & Organizations",
    icon: BuildingOfficeIcon,
    color: "blue",
  },
  {
    value: "Venues & Locations",
    label: "Venues & Locations",
    icon: MapPinIcon,
    color: "green",
  },
  {
    value: "Awards & Honors",
    label: "Awards & Honors",
    icon: TrophyIcon,
    color: "yellow",
  },
  {
    value: "Leadership & Staff",
    label: "Leadership & Staff",
    icon: BriefcaseIcon,
    color: "purple",
  },
];

export default function ThemeSelector({
  selectedTheme,
  onThemeSelect,
}: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isSelected = selectedTheme === theme.value;

        return (
          <button
            key={theme.value}
            onClick={() => onThemeSelect(theme.value)}
            className={`
              relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
              ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50"
              }
            `}
          >
            <Icon
              className={`h-8 w-8 mb-2 ${
                isSelected ? "text-indigo-600" : "text-gray-400"
              }`}
            />
            <span
              className={`text-sm font-semibold text-center ${
                isSelected ? "text-indigo-900" : "text-gray-700"
              }`}
            >
              {theme.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
