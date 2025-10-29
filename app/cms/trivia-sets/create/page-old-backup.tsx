"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface Question {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "who-am-i";
  options?: string[];
  correct_answer: string;
  wrong_answers?: string[];
  explanation?: string;
}

export default function CreateTriviaSetPage() {
  const router = useRouter();

  // Essential Info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Categorization
  const [theme, setTheme] = useState("");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("en");
  const [targetAudience, setTargetAudience] = useState("");

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Publishing
  const [status, setStatus] = useState<
    "Draft" | "Review" | "Approved" | "Archived"
  >("Draft");
  const [visibility, setVisibility] = useState<
    "Public" | "Unlisted" | "Private"
  >("Private");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Auto-generate slug from name
  useEffect(() => {
    if (name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setSlug(generatedSlug);
    }
  }, [name]);

  // Add a new question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correct_answer: "",
      wrong_answers: [],
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  // Update question
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    );
  };

  // Delete question
  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (expandedQuestion === id) {
      setExpandedQuestion(null);
    }
  };

  // Toggle question expansion
  const toggleQuestion = (id: string) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  // Check if question is complete
  const isQuestionComplete = (q: Question): boolean => {
    if (!q.question.trim()) return false;
    if (!q.correct_answer.trim()) return false;

    if (q.type === "multiple-choice") {
      return q.options?.every((opt) => opt.trim()) ?? false;
    }

    return true;
  };

  // Calculate format type
  const getFormatType = (): string => {
    if (questions.length === 0) return "Not set";

    const types = new Set(questions.map((q) => q.type));
    if (types.size === 1) {
      const type = Array.from(types)[0];
      if (type === "multiple-choice") return "Multiple Choice";
      if (type === "true-false") return "True/False";
      if (type === "who-am-i") return "Who Am I";
    }
    return "Mixed";
  };

  // Calculate estimated time
  const getEstimatedTime = (): string => {
    if (questions.length === 0) return "0 minutes";
    const min = Math.floor(questions.length * 0.8);
    const max = Math.ceil(questions.length * 1.2);
    return `${min}-${max} minutes`;
  };

  // Transform questions to database format
  const transformQuestionsForDB = (): any[] => {
    return questions.map((q) => {
      if (q.type === "multiple-choice" && q.options) {
        // Find correct and wrong answers from options
        const correctIdx = q.options.findIndex(
          (opt) => opt === q.correct_answer,
        );
        const wrongAnswers = q.options.filter(
          (opt, idx) => idx !== correctIdx && opt.trim(),
        );

        return {
          question: q.question,
          question_type: q.type,
          correct_answer: q.correct_answer,
          wrong_answers: wrongAnswers,
          explanation: q.explanation || undefined,
        };
      } else if (q.type === "true-false") {
        return {
          question: q.question,
          question_type: q.type,
          correct_answer: q.correct_answer,
          wrong_answers: [q.correct_answer === "True" ? "False" : "True"],
          explanation: q.explanation || undefined,
        };
      } else {
        // who-am-i
        return {
          question: q.question,
          question_type: q.type,
          correct_answer: q.correct_answer,
          wrong_answers: [],
          explanation: q.explanation || undefined,
        };
      }
    });
  };

  // Save trivia set
  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      setSaveMessage("❌ Please enter a name for the trivia set");
      return;
    }

    if (questions.length === 0) {
      setSaveMessage("❌ Please add at least one question");
      return;
    }

    const incompleteQuestions = questions.filter((q) => !isQuestionComplete(q));
    if (incompleteQuestions.length > 0) {
      setSaveMessage(
        `❌ ${incompleteQuestions.length} question(s) are incomplete`,
      );
      return;
    }

    setIsSaving(true);
    setSaveMessage("Saving...");

    try {
      const response = await fetch("/api/trivia-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          description: description || null,
          theme: theme || null,
          tags: tags
            ? tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          language,
          target_audience: targetAudience || null,
          format_type: getFormatType(),
          estimated_time_minutes: parseInt(getEstimatedTime().split("-")[0]),
          question_count: questions.length,
          question_data: transformQuestionsForDB(),
          thumbnail_url: thumbnailUrl || null,
          status,
          visibility,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save trivia set");
      }

      setSaveMessage("✅ Trivia set saved successfully!");

      // Redirect to all sets page after 1 second
      setTimeout(() => {
        router.push("/cms/trivia-sets");
      }, 1000);
    } catch (error) {
      setSaveMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Trivia Set
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Build a curated trivia set with metadata and questions
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              saveMessage.includes("✅")
                ? "bg-green-50 border-green-200 text-green-800"
                : saveMessage.includes("❌")
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <p className="text-sm font-medium">{saveMessage}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Essential Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Essential Info
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., NHL Mascots Trivia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug{" "}
                  <span className="text-gray-400 text-xs">
                    (auto-generated)
                  </span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="nhl-mascots-trivia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief summary of this trivia set..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Categorization */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Categorization
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g., NHL History"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags{" "}
                  <span className="text-gray-400 text-xs">
                    (comma-separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="hockey, mascots, fun-facts"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select audience...</option>
                  <option value="Kids">Kids</option>
                  <option value="Novices">Novices</option>
                  <option value="True Fans">True Fans</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Questions ({questions.length})
              </h2>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500"
              >
                <PlusIcon className="h-4 w-4" />
                Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">
                  No questions yet. Click &quot;Add Question&quot; to get
                  started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, index) => (
                  <div key={q.id} className="border border-gray-200 rounded-lg">
                    <div
                      onClick={() => toggleQuestion(q.id)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {isQuestionComplete(q) ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Question {index + 1}: {q.question || "Untitled"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {q.type === "multiple-choice"
                              ? "Multiple Choice"
                              : q.type === "true-false"
                                ? "True/False"
                                : "Who Am I"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuestion(q.id);
                        }}
                        className="ml-3 p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {expandedQuestion === q.id && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Text
                          </label>
                          <textarea
                            value={q.question}
                            onChange={(e) =>
                              updateQuestion(q.id, { question: e.target.value })
                            }
                            placeholder="Enter your question..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Type
                          </label>
                          <select
                            value={q.type}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                type: e.target.value as Question["type"],
                                options:
                                  e.target.value === "multiple-choice"
                                    ? ["", "", "", ""]
                                    : undefined,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="multiple-choice">
                              Multiple Choice
                            </option>
                            <option value="true-false">True/False</option>
                            <option value="who-am-i">Who Am I</option>
                          </select>
                        </div>

                        {q.type === "multiple-choice" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Options
                            </label>
                            <div className="space-y-2">
                              {q.options?.map((option, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-sm font-medium text-gray-600 w-6">
                                    {String.fromCharCode(65 + idx)})
                                  </span>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(q.options || [])];
                                      newOptions[idx] = e.target.value;
                                      updateQuestion(q.id, {
                                        options: newOptions,
                                      });
                                    }}
                                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correct Answer
                          </label>
                          {q.type === "multiple-choice" ? (
                            <select
                              value={q.correct_answer}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  correct_answer: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Select correct answer...</option>
                              {q.options?.map((option, idx) => (
                                <option key={idx} value={option}>
                                  {String.fromCharCode(65 + idx)}) {option}
                                </option>
                              ))}
                            </select>
                          ) : q.type === "true-false" ? (
                            <select
                              value={q.correct_answer}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  correct_answer: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Select...</option>
                              <option value="True">True</option>
                              <option value="False">False</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={q.correct_answer}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  correct_answer: e.target.value,
                                })
                              }
                              placeholder="Enter the answer..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Explanation (optional)
                          </label>
                          <textarea
                            value={q.explanation}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                explanation: e.target.value,
                              })
                            }
                            placeholder="Provide additional context or explanation..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata (Auto-calculated) */}
          <div className="bg-gray-100 rounded-lg border border-gray-300 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Metadata (Auto-calculated)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Format Type</p>
                <p className="font-medium text-gray-900">{getFormatType()}</p>
              </div>
              <div>
                <p className="text-gray-600">Question Count</p>
                <p className="font-medium text-gray-900">{questions.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Estimated Time</p>
                <p className="font-medium text-gray-900">
                  {getEstimatedTime()}
                </p>
              </div>
            </div>
          </div>

          {/* Publishing */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Publishing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Review">Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value as typeof visibility)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Private">Private</option>
                  <option value="Unlisted">Unlisted</option>
                  <option value="Public">Public</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL (optional)
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-6">
            <button
              onClick={() => router.back()}
              disabled={isSaving}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name || questions.length === 0}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Trivia Set"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
