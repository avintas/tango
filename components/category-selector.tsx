"use client";

import clsx from "clsx";

interface CategorySelectorProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
  categoryCounts: { [key: string]: number };
  isLoadingCategories: boolean;
}

const Button = ({
  onClick,
  isSelected,
  children,
}: {
  onClick: () => void;
  isSelected: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 text-xs transition-colors h-20 w-full text-center",
      isSelected
        ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
    )}
  >
    {children}
  </button>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-5 gap-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
    ))}
  </div>
);

export default function CategorySelector({
  selectedCategory,
  onCategorySelect,
  categoryCounts,
  isLoadingCategories,
}: CategorySelectorProps) {
  if (isLoadingCategories) return <LoadingSkeleton />;

  const categories = Object.keys(categoryCounts).sort();

  return (
    <div className="grid grid-cols-5 gap-4">
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => onCategorySelect(category)}
          isSelected={selectedCategory === category}
        >
          <span className="text-lg">✨</span>
          <span className="font-medium text-xs">
            {category} ({categoryCounts[category]})
          </span>
        </Button>
      ))}
    </div>
  );
}
