'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface TriviaSet {
  id: string;
  original_text: string;
  content_type: string;
  content_tags: string[];
  created_at: string;
}

interface Question {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export default function TriviaSetPage() {
  const params = useParams();
  const [triviaSet, setTriviaSet] = useState<TriviaSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTriviaSet(params.id as string);
    }
  }, [params.id]);

  const fetchTriviaSet = async (id: string) => {
    try {
      const response = await fetch(`/api/trivia-sets/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTriviaSet(data.triviaSet);
        parseQuestions(data.triviaSet.original_text);
      }
    } catch (error) {
      console.error('Error fetching trivia set:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseQuestions = (markdownContent: string) => {
    // Simple parsing logic for trivia questions from markdown
    const lines = markdownContent.split('\n').filter(line => line.trim());
    const parsedQuestions: Question[] = [];
    let currentQuestion: Partial<Question> = {};

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        // New question
        if (currentQuestion.question) {
          parsedQuestions.push(currentQuestion as Question);
        }
        currentQuestion = {
          question: line.replace(/^\d+\.\s*/, ''),
          options: [],
        };
      } else if (line.match(/^[A-D]\./)) {
        // Answer option
        currentQuestion.options?.push(line.replace(/^[A-D]\.\s*/, ''));
      } else if (
        line.toLowerCase().includes('answer:') ||
        line.toLowerCase().includes('correct:')
      ) {
        // Answer
        currentQuestion.answer = line.replace(/.*(?:answer|correct):\s*/i, '');
      }
    }

    // Add the last question
    if (currentQuestion.question) {
      parsedQuestions.push(currentQuestion as Question);
    }

    setQuestions(parsedQuestions);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.answer;

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setGameCompleted(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-blue-50 p-8 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trivia game...</p>
        </div>
      </div>
    );
  }

  if (!triviaSet) {
    return (
      <div className="max-w-4xl mx-auto bg-blue-50 p-8 rounded-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Trivia Set Not Found
          </h1>
          <Link
            href="/trivia-sets"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to TriviaSets
          </Link>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="max-w-4xl mx-auto bg-blue-50 p-8 rounded-lg">
        <div className="text-center">
          <div className="mb-8">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Game Complete!
            </h1>
            <p className="text-xl text-gray-600">
              You scored {score} out of {questions.length} questions
            </p>
            <p className="text-lg text-gray-500 mt-2">
              {((score / questions.length) * 100).toFixed(0)}% correct
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={resetGame}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Play Again
            </button>
            <Link
              href="/trivia-sets"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to TriviaSets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto bg-blue-50 p-8 rounded-lg">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/trivia-sets"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to TriviaSets
        </Link>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Hockey Trivia</h1>
          <div className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <div className="mt-4 bg-white rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      {currentQ && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQ.question}
          </h2>

          {/* Answer Options */}
          {currentQ.options && currentQ.options.length > 0 ? (
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQ.answer;

                let buttonClass =
                  'w-full text-left p-4 rounded-lg border-2 transition-colors duration-200 ';

                if (showResult) {
                  if (isCorrect) {
                    buttonClass +=
                      'border-green-500 bg-green-50 text-green-800';
                  } else if (isSelected && !isCorrect) {
                    buttonClass += 'border-red-500 bg-red-50 text-red-800';
                  } else {
                    buttonClass += 'border-gray-200 bg-gray-50 text-gray-600';
                  }
                } else {
                  buttonClass += isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={buttonClass}
                    disabled={showResult}
                  >
                    <span className="font-medium">{letter}.</span> {option}
                    {showResult && isCorrect && (
                      <CheckCircleIcon className="inline h-5 w-5 ml-2 text-green-500" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircleIcon className="inline h-5 w-5 ml-2 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-gray-600">
                This appears to be a different type of question format.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {currentQ.question}
                </pre>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">
              Score: {score}/{questions.length}
            </div>

            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {currentQuestion < questions.length - 1
                  ? 'Next Question'
                  : 'Finish Game'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
