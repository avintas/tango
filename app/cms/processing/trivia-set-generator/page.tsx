"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";
import ContentTypeSelector, {
  ContentType,
} from "@/components/content-type-selector";
import ThemeSelector, { Theme } from "@/components/theme-selector";
import QuestionBank from "@/components/question-bank";
import type { TriviaQuestion } from "@/lib/supabase";
import { Alert } from "@/components/alert";
import type { Category } from "@/lib/supabase";
import { Select } from "@/components/select";

export default function TriviaSetGeneratorPage() {
  const router = useRouter();

  // State for the new trivia set
  const [title, setTitle] = useState("Daily Trivia");
  const [description, setDescription] = useState("");
  const [triviaType, setTriviaType] = useState<
    "multiple-choice" | "true-false" | "who-am-i" | "all"
  >("all");
  const [theme, setTheme] = useState<Theme | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Add a key to force re-mount of QuestionBank on reset
  const [questionBankKey, setQuestionBankKey] = useState(Date.now());

  // State for the assembly area
  const [selectedQuestions, setSelectedQuestions] = useState<TriviaQuestion[]>(
    [],
  );

  // UI State
  const [statusMessage, setStatusMessage] = useState<string>(
    "Welcome! Define your set to get started.",
  );
  const [statusType, setStatusType] = useState<"success" | "info" | "error">(
    "info",
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const catResponse = await fetch("/api/categories");
        const catResult = await catResponse.json();
        if (!catResult.success) throw new Error(catResult.error);
        const cats: Category[] = catResult.data;
        setCategories(cats.map((c) => c.name));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleThemeSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    setStatusMessage(`Theme set to '${selectedTheme}'.`);
    setStatusType("info");
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    const newTitle = selectedCategory
      ? `${selectedCategory} Trivia`
      : "Daily Trivia";
    setTitle(newTitle);
    setStatusMessage(
      `Category set to '${selectedCategory}'. Title automatically updated.`,
    );
    setStatusType("info");
  };

  const handleSelectQuestion = (question: TriviaQuestion) => {
    // Avoid adding duplicates
    if (!selectedQuestions.find((q) => q.id === question.id)) {
      setSelectedQuestions([...selectedQuestions, question]);
      setStatusMessage(`Question #${question.id} added to your set.`);
      setStatusType("info");
    }
  };

  const handleRemoveQuestion = (questionId: number) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== questionId));
    setStatusMessage(`Question #${questionId} removed from your set.`);
    setStatusType("info");
  };

  const handleFinalizeSet = async () => {
    setIsSaving(true);
    setStatusMessage("Finalizing your set...");
    setStatusType("info");

    const createSlug = (text: string) =>
      text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    const newSet = {
      title,
      slug: createSlug(title),
      description,
      category: category,
      tags: category ? [category] : [],
      question_count: selectedQuestions.length,
      question_data: selectedQuestions,
      status: "draft",
      visibility: "Private",
    };

    try {
      const response = await fetch("/api/trivia-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSet),
      });

      if (!response.ok) {
        throw new Error("Failed to save the trivia set.");
      }

      const savedSet = await response.json();
      setStatusMessage(`'${savedSet.title}' has been saved as a draft!`);
      setStatusType("success");

      // Reset the form after a short delay to allow user to see message
      setTimeout(() => {
        setTitle("Daily Trivia");
        setDescription("");
        setCategory(null);
        setSelectedQuestions([]);
        setQuestionBankKey(Date.now()); // Change the key to force reset
        setStatusMessage("Ready to create another set.");
        setStatusType("info");
        setIsSaving(false);
      }, 2500);
    } catch (error) {
      console.error(error);
      setStatusMessage("Error: Could not save the set. Please try again.");
      setStatusType("error");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Trivia Set Generator
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Follow the steps to assemble a new trivia set from your question
          library.
        </p>
      </div>

      {/* Step-based Layout */}
      <div className="space-y-4 mb-6">
        {/* Step 1: Content Type Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900">
            <span className="bg-indigo-600 text-white rounded-full h-8 w-8 inline-flex items-center justify-center text-sm font-bold mr-3">
              1
            </span>
            Content Type Selector
          </h2>
          <p className="text-xs text-gray-500 ml-11 mb-4">
            Choose the type of questions to include in your set.
          </p>
          <div className="pl-11">
            <ContentTypeSelector
              selectedType={
                triviaType === "all" ? null : (triviaType as ContentType)
              }
              onTypeSelect={(type) =>
                setTriviaType(
                  type as "multiple-choice" | "true-false" | "who-am-i",
                )
              }
              allowedTypes={["multiple-choice", "true-false", "who-am-i"]}
            />
          </div>
        </div>

        {/* Step 2: Theme Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900">
            <span className="bg-indigo-600 text-white rounded-full h-8 w-8 inline-flex items-center justify-center text-sm font-bold mr-3">
              2
            </span>
            Theme
          </h2>
          <p className="text-xs text-gray-500 ml-11 mb-4">
            Filter questions by a specific theme.
          </p>
          <div className="pl-11">
            <ThemeSelector
              selectedTheme={theme}
              onThemeSelect={handleThemeSelect}
            />
          </div>
        </div>
      </div>

      {/* --- Information Panel --- */}
      <div className="mb-6">
        <Alert type={statusType} message={statusMessage} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        {/* Center Panel: Question Bank */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex-shrink-0">
            <span className="bg-indigo-600 text-white rounded-full h-8 w-8 inline-flex items-center justify-center text-sm font-bold mr-3">
              3
            </span>
            Select Questions
          </h2>
          <div className="flex-grow min-h-0">
            <QuestionBank
              key={questionBankKey}
              onSelectQuestion={handleSelectQuestion}
              typeFilter={triviaType}
              themeFilter={theme || null}
            />
          </div>
        </div>

        {/* Right Panel: Assembly Area */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-base font-semibold text-gray-900">
              <span className="bg-indigo-600 text-white rounded-full h-8 w-8 inline-flex items-center justify-center text-sm font-bold mr-3">
                4
              </span>
              Your New Set ({selectedQuestions.length})
            </h2>
          </div>
          <div className="flex-grow overflow-y-auto space-y-2 pr-2">
            {selectedQuestions.length === 0 ? (
              <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  Selected questions will appear here...
                </p>
              </div>
            ) : (
              selectedQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between"
                >
                  <span className="text-xs text-gray-800">
                    <span className="font-semibold">{index + 1}.</span>{" "}
                    {q.question_text}
                  </span>
                  <button
                    onClick={() => handleRemoveQuestion(q.id)}
                    title="Remove Question"
                  >
                    <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Left Panel: Define Set */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            <span className="bg-indigo-600 text-white rounded-full h-8 w-8 inline-flex items-center justify-center text-sm font-bold mr-3">
              5
            </span>
            Define Your Set
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Working Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Daily Trivia - Oct 26"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="A brief description of this set..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Category{" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              {isLoadingCategories ? (
                <div className="mt-1 h-10 bg-gray-200 rounded-lg animate-pulse w-full" />
              ) : (
                <Select
                  value={category || ""}
                  onChange={(e) =>
                    handleCategorySelect(
                      (e as React.ChangeEvent<HTMLSelectElement>).target.value,
                    )
                  }
                >
                  <option value="">None (General)</option>
                  {categories.sort().map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              )}
            </div>
            <div className="pt-2">
              <button
                className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center"
                disabled={
                  selectedQuestions.length === 0 || !title.trim() || isSaving
                }
                onClick={handleFinalizeSet}
              >
                {isSaving ? "Saving..." : "Finalize Set"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
