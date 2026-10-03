"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calculator,
  ExamHeader,
  Disclaimer,
  TestResults,
  TestInstructions,
  MatchingQuestion,
} from "@/components/molecules/student-dashboard";
import { Modal } from "@/components/molecules";
import { Icon } from "@iconify/react";
import { useExamProtection, useExamLeaveGuard } from "@/hooks";
import { cn } from "@/lib/utils";
import { Button, CheckBox, Radio, ContentRenderer } from "@/components/atoms";
import { InputField } from "@/components/molecules";
import { useExamStore, useAuthStore, useStudentStore } from "@/store";
import type { IQuestionResponse, IFlagUpdate } from "@/types";

interface QuestionResult {
  answered: boolean;
  correct?: boolean;
}

function formatDuration(secs: number): string {
  const totalMins = Math.floor(secs / 60);
  if (totalMins >= 60) {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return m > 0 ? `${h} hr ${m} mins` : `${h} hr`;
  }
  return `${totalMins} minutes`;
}

function formatTimeUsed(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h} hr ${m > 0 ? `${m} min ` : ""}${s} sec`;
  if (m > 0) return `${m} min ${s} sec`;
  return `${s} sec`;
}

function TimedSkeleton() {
  return (
    <section className="bg-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 pb-8">
            <div
              style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)" }}
              className="bg-white rounded-[1.5rem] p-3 sm:p-4 md:p-6 space-y-6"
            >
              <div className="rounded-[1rem] bg-[#007FFF]/10 h-[6rem]" />
              <div className="rounded-[1rem] bg-gray-100 h-72 sm:h-96" />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex gap-2">
                  <div className="h-10 flex-1 sm:flex-none sm:w-24 bg-gray-100 rounded-lg" />
                  <div className="h-10 flex-1 sm:flex-none sm:w-24 bg-gray-100 rounded-lg" />
                </div>
                <div className="flex">
                  <div className="h-10 flex-1 sm:flex-none sm:w-32 bg-gray-200 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-2 lg:hidden">
                <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-4">
            <div className="rounded-[1.5rem] bg-gray-100 h-64" />
            <div className="rounded-[2rem] bg-gray-100 h-[26rem]" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Timed() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    pendingConfig,
    examSession,
    isStartingExam,
    startExam,
    submitExam,
    examResult,
    isSubmittingExam,
    clearSession,
    getQuestion,
    getPassage,
    prefetchAround,
    loadingPages,
  } = useExamStore();
  const { fetchDashboard, granularity } = useStudentStore();

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | Record<string, string>>
  >({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [questionResults, setQuestionResults] = useState<
    Record<number, QuestionResult>
  >({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const navDragStartY = useRef(0);
  const [navDragY, setNavDragY] = useState(0);
  const isNavigatingAway = useRef(false);
  const [isNavigationMinimized, setIsNavigationMinimized] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [fullDetailsTopic, setFullDetailsTopic] = useState("");
  const [fullDetailsTopicId, setFullDetailsTopicId] = useState<string | null>(
    null,
  );
  const [fullDetailsContent, setFullDetailsContent] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  useExamProtection(!isExamSubmitted && !showInstructions);
  const { showLeaveModal, dismissLeaveModal } =
    useExamLeaveGuard(!isExamSubmitted && !showInstructions);

  // Seed flaggedQuestions from previously flagged IDs when session loads
  useEffect(() => {
    if (examSession?.flaggedQuestionIds?.length) {
      setFlaggedQuestions(new Set(examSession.flaggedQuestionIds));
    }
  }, [examSession?.examAttemptId, examSession?.flaggedQuestionIds]);

  // Initialize countdown once the session arrives
  useEffect(() => {
    if (examSession && timeLeft === null) {
      setTimeLeft(examSession.timeLimitSeconds ?? 90 * 60);
    }
  }, [examSession, timeLeft]);

  // Stable submit (auto-called by timer — no confirm dialog needed when time runs out)
  const handleFinalSubmit = useCallback(async () => {
    const elapsed = examSession
      ? Math.floor(
          (Date.now() - new Date(examSession.startedAt).getTime()) / 1000,
        )
      : 0;
    // Build responses from answers dict — works regardless of pagination
    const responses: IQuestionResponse[] = Object.entries(answers)
      .filter(([, a]) => {
        if (Array.isArray(a)) return a.length > 0;
        if (typeof a === "string") return a.trim() !== "";
        return a !== null && a !== undefined;
      })
      .map(([questionId, answer]) => ({
        questionId,
        answer,
        timeSpent: 0,
        isFlagged: flaggedQuestions.has(questionId),
      }));
    // Compute delta: new flags added this session + pre-flagged that were removed
    const preflaggedIds = new Set(examSession?.flaggedQuestionIds ?? []);
    const flagUpdates: IFlagUpdate[] = [
      ...[...flaggedQuestions]
        .filter((id) => !preflaggedIds.has(id))
        .map((id) => ({ questionId: id, isFlagged: true })),
      ...[...preflaggedIds]
        .filter((id) => !flaggedQuestions.has(id))
        .map((id) => ({ questionId: id, isFlagged: false })),
    ];
    await submitExam(
      responses,
      elapsed,
      flagUpdates.length ? flagUpdates : undefined,
    );
    setIsExamSubmitted(true);
    setShowResults(true);
  }, [examSession, answers, flaggedQuestions, submitExam]);

  const handleConfirmSubmit = useCallback(() => {
    setShowConfirmModal(false);
    handleFinalSubmit();
  }, [handleFinalSubmit]);

  // Countdown — stops when exam submitted
  useEffect(() => {
    if (isLoading || timeLeft === null || isExamSubmitted) return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isLoading, isExamSubmitted, handleFinalSubmit]);

  // Redirect after render if no active session — avoids setState-during-render warning
  useEffect(() => {
    if (!pendingConfig && !examSession) {
      router.replace("/student/exams");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!pendingConfig, !!examSession]);

  const shouldClearRef = useRef(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (shouldClearRef.current) clearSession(); }, []);

  // Session guard — after all hooks
  if (!isNavigatingAway.current && !pendingConfig && !examSession) {
    return <TimedSkeleton />;
  }

  const totalQuestions =
    examSession?.totalCount ?? pendingConfig?.questionCount ?? 0;
  const examTypeName =
    examSession?.examTypeName ?? pendingConfig?.examTypeName ?? "";
  const subjectNames =
    examSession?.subjectNames ?? pendingConfig?.subjectNames ?? [];
  const userName = user?.firstName ?? "Student";
  const timeLimitSeconds =
    examSession?.timeLimitSeconds ?? pendingConfig?.timeLimitSeconds ?? 90 * 60;

  const questionIndex = currentQuestion - 1;
  const question = getQuestion(questionIndex);
  const currentPage = Math.floor(questionIndex / 20);
  const isPageLoading = loadingPages.has(currentPage);

  const isEssay = question?.type === "essay";
  const isFillInBlank = question?.type === "fill_in_the_blank";
  const isShortAnswer = question?.type === "short_answer";
  const isMultipleResponse = question?.type === "multiple_response";
  const isMatching = question?.type === "matching";
  const isTextInput = isFillInBlank || isShortAnswer;
  const passage = question?.passageId ? getPassage(question.passageId) : null;
  const hideScore =
    examSession?.category === "theory" ||
    examSession?.category === "practical";

  // Frozen = whole exam submitted OR this question individually confirmed
  const isCurrentFrozen =
    isExamSubmitted || submittedQuestions.has(currentQuestion);

  const correctCount = Object.values(questionResults).filter(
    (r) => r.correct,
  ).length;
  const incorrectCount = Object.values(questionResults).filter(
    (r) => r.answered && !r.correct,
  ).length;
  const answeredCount = Object.keys(questionResults).length;
  const score =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleSelectOption = (optionId: string) => {
    if (!question || isCurrentFrozen) return;
    if (isMultipleResponse) {
      const current = (answers[question.id] as string[]) ?? [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      setAnswers({ ...answers, [question.id]: updated });
    } else {
      setAnswers({ ...answers, [question.id]: optionId });
    }
  };

  const handleSubmitAnswer = () => {
    if (!question) return;
    const answer = answers[question.id];
    const correctAnswer = question.correctAnswer;
    let isCorrect: boolean;

    if (isEssay) {
      isCorrect = false;
    } else if (isTextInput) {
      const studentAnswer =
        typeof answer === "string" ? answer.trim().toLowerCase() : "";
      const keywords = (
        Array.isArray(correctAnswer)
          ? (correctAnswer as string[])
          : String(correctAnswer ?? "").split(/[\n,/]/)
      )
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
      isCorrect = keywords.length > 0 && keywords.some((kw) => studentAnswer.includes(kw));
    } else if (isMultipleResponse) {
      const selected = Array.isArray(answer) ? [...answer].sort() : [];
      const correct = Array.isArray(correctAnswer)
        ? [...(correctAnswer as string[])].sort()
        : [];
      isCorrect =
        selected.length === correct.length &&
        selected.every((v, i) => v === correct[i]);
    } else if (isMatching) {
      const answerMap = (answer as Record<string, string>) ?? {};
      const correctMap = (correctAnswer as Record<string, string>) ?? {};
      isCorrect = Object.entries(correctMap).every(
        ([k, v]) =>
          answerMap[k]?.trim().toLowerCase() === v.trim().toLowerCase(),
      );
    } else {
      // MULTIPLE_CHOICE / TRUE_FALSE
      isCorrect = correctAnswer !== undefined && answer === correctAnswer;
    }

    setSubmittedQuestions(new Set([...submittedQuestions, currentQuestion]));
    setQuestionResults({
      ...questionResults,
      [currentQuestion]: { answered: true, correct: isCorrect },
    });
  };

  const handleToggleFlag = () => {
    if (isExamSubmitted || !question) return;
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(question.id)) {
      newFlagged.delete(question.id);
    } else {
      newFlagged.add(question.id);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      const prev = currentQuestion - 1;
      setCurrentQuestion(prev);
      prefetchAround(prev - 1);
    }
  };

  const handleReviewTest = () => {
    setShowResults(false);
    setCurrentQuestion(1);
  };

  const handleReturnToMain = () => {
    isNavigatingAway.current = true;
    shouldClearRef.current = true;
    router.push("/student/exams");
    fetchDashboard(granularity);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getOptionState = (optionId: string) => {
    if (!question) return "default";
    const wasSubmitted = submittedQuestions.has(currentQuestion);
    // During exam: only reveal after per-question submission
    // During review (isExamSubmitted): always reveal correct answer
    if (!isExamSubmitted && !wasSubmitted) return "default";
    const correctAnswer = question.correctAnswer;
    const correctSet = Array.isArray(correctAnswer)
      ? correctAnswer
      : correctAnswer != null
        ? [correctAnswer as string]
        : [];
    if (correctSet.includes(optionId)) return "correct";
    // Only show red for answers the student actually submitted (not just selected)
    if (wasSubmitted) {
      const userAnswer = answers[question.id];
      const selectedSet = Array.isArray(userAnswer)
        ? userAnswer
        : userAnswer != null
          ? [userAnswer as string]
          : [];
      if (selectedSet.includes(optionId)) return "incorrect";
    }
    return "default";
  };

  const handleAttemptTest = async () => {
    await startExam();
    setIsLoading(false);
    setShowInstructions(false);
  };

  const getCorrectAnswerDisplay = (q: typeof question): string => {
    if (!q?.correctAnswer) return "";
    const ca = q.correctAnswer;
    if (typeof ca === "string") {
      // MCQ / true-false / fill-in-the-blank
      if (q.options && q.options.length > 0) return `Option ${ca}`;
      return ca;
    }
    if (Array.isArray(ca)) {
      // Multiple response
      return `Options ${ca.join(", ")}`;
    }
    if (typeof ca === "object") {
      // Matching
      return Object.entries(ca)
        .map(([k, v]) => `${k} → ${v}`)
        .join("; ");
    }
    return String(ca);
  };

  const getCorrectAnswerLetter = (q: typeof question): string => {
    if (!q?.correctAnswer || !q.options?.length) return "";
    const idx = q.options.findIndex((o) => o.id === q.correctAnswer);
    if (idx === -1) return String(q.correctAnswer);
    return String.fromCharCode(65 + idx);
  };

  const handleShowFullDetails = () => {
    if (!question) return;
    setFullDetailsTopic(question.topicName ?? "");
    setFullDetailsTopicId(question.topicId ?? null);
    setFullDetailsContent(question.explanation ?? "");
    setShowFullDetails(true);
  };

  const getButtonStyle = (num: number) => {
    if (questionResults[num]?.answered) {
      if (hideScore) return "bg-blue-100 text-blue-600";
      return questionResults[num].correct
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";
    }
    // In review mode, questions never individually submitted = unanswered
    if (isExamSubmitted && !questionResults[num]?.answered) {
      return "bg-amber-50 text-amber-600 border-amber-300";
    }
    if (currentQuestion === num) return "bg-blue-500 text-white";
    return "bg-gray-100 text-gray-600 hover:bg-gray-200";
  };

  if (showResults) {
    return (
      <TestResults
        totalQuestions={totalQuestions}
        answeredQuestions={
          examResult
            ? examResult.correctAnswers + examResult.wrongAnswers
            : answeredCount
        }
        correctAnswers={examResult?.correctAnswers ?? correctCount}
        incorrectAnswers={examResult?.wrongAnswers ?? incorrectCount}
        unattempted={examResult?.unanswered ?? totalQuestions - answeredCount}
        score={
          examResult?.scorePercentage ?? (correctCount / totalQuestions) * 100
        }
        timeUsed={
          examResult?.timeSpentSeconds != null
            ? formatTimeUsed(examResult.timeSpentSeconds)
            : undefined
        }
        hideScore={hideScore}
        onReviewTest={handleReviewTest}
        onReturnToMain={handleReturnToMain}
      />
    );
  }

  const isAnswered = submittedQuestions.has(currentQuestion);

  return (
    <>
      {showInstructions && (
        <TestInstructions
          examType={examTypeName}
          subjects={subjectNames}
          duration={formatDuration(timeLimitSeconds)}
          questionCount={totalQuestions}
          userName={userName}
          onGoBack={() => router.back()}
          onAttemptTest={handleAttemptTest}
          isAttempting={isStartingExam}
        />
      )}
      {isLoading || isPageLoading ? (
        <TimedSkeleton />
      ) : (
        <section className="bg-white p-4 md:p-6 select-none">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left — question area */}
              <div className="lg:col-span-2 space-y-12 pb-8">
                <div
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                  }}
                  className="p-3 sm:p-4 md:p-6 bg-white rounded-[1.5rem] space-y-6"
                >
                  <ExamHeader examType={examTypeName} subjects={subjectNames} />

                  {question && (
                    <div
                      style={{
                        boxShadow:
                          "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                      }}
                      className="bg-white rounded-[1rem] p-[1rem_1rem_1.5rem_1rem] sm:p-[1.25rem_1.375rem_2rem_1.375rem]"
                    >
                      <div className="flex items-center justify-between pb-5 border-b border-[#EDEDED]">
                        <h3 className="font-semibold text-gray-900">
                          Question {currentQuestion}
                        </h3>
                        <button
                          onClick={handleToggleFlag}
                          disabled={isExamSubmitted}
                          className={cn(
                            "p-2.5 flex items-center justify-center rounded-[1.25rem] transition-colors",
                            question && flaggedQuestions.has(question.id)
                              ? "bg-pink-100 text-pink-500 hover:bg-pink-200"
                              : "bg-gray-100 text-[#454545] hover:bg-gray-200",
                            isExamSubmitted && "opacity-40 cursor-not-allowed",
                          )}
                        >
                          <Icon icon="hugeicons:flag-02" className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pt-5">
                        {/* Unanswered badge — shown during review for skipped questions */}
                        {isExamSubmitted &&
                          !submittedQuestions.has(currentQuestion) && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-4">
                              <Icon
                                icon="hugeicons:alert-02"
                                className="w-4 h-4"
                              />
                              Unanswered
                            </div>
                          )}
                        {passage && (
                          <div className="mb-5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4">
                            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                              Read the passage below
                            </p>
                            {passage.title && (
                              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                                {passage.title}
                              </h4>
                            )}
                            <div className="text-sm text-gray-700 leading-relaxed max-h-56 overflow-y-auto pr-1">
                              <ContentRenderer content={passage.content} contentFormat={passage.contentFormat} />
                            </div>
                          </div>
                        )}
                        <div className="text-gray-700 mb-6 text-[.9375rem] leading-relaxed">
                          <ContentRenderer content={question.questionText} contentFormat={question.contentFormat} />
                        </div>

                        {/* ── Essay ── */}
                        {isEssay ? (
                          <InputField
                            type="rich-text"
                            name={`essay-${question.id}`}
                            placeholder="Type Your Answer Here"
                            value={(answers[question.id] as string) ?? ""}
                            readOnly={isCurrentFrozen}
                            onChange={(e: { target: { name?: string; value: any } }) =>
                              setAnswers({
                                ...answers,
                                [question.id]: e.target.value,
                              })
                            }
                          />
                        ) : isTextInput ? (
                          /* ── Fill in the blank / Short answer ── */
                          <div>
                            <input
                              type="text"
                              value={(answers[question.id] as string) ?? ""}
                              onChange={(e) =>
                                !isCurrentFrozen &&
                                setAnswers({
                                  ...answers,
                                  [question.id]: e.target.value,
                                })
                              }
                              disabled={isCurrentFrozen}
                              placeholder="Type your answer here…"
                              className={cn(
                                "w-full border rounded-lg px-4 py-3 text-sm outline-none transition-colors",
                                isCurrentFrozen
                                  ? questionResults[currentQuestion]?.correct
                                    ? "border-green-400 bg-green-50 text-green-700 cursor-not-allowed"
                                    : submittedQuestions.has(currentQuestion)
                                      ? "border-red-400 bg-red-50 text-red-600 cursor-not-allowed"
                                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                                  : "border-gray-300 focus:border-blue-400",
                              )}
                            />
                            {(submittedQuestions.has(currentQuestion) &&
                              !questionResults[currentQuestion]?.correct) ||
                            (isExamSubmitted &&
                              !submittedQuestions.has(currentQuestion))
                              ? question.correctAnswer && (
                                  <p className="mt-2 text-sm font-medium text-green-700">
                                    Correct answer:{" "}
                                    <span className="font-bold">
                                      {String(question.correctAnswer)}
                                    </span>
                                  </p>
                                )
                              : null}
                          </div>
                        ) : isMultipleResponse ? (
                          /* ── Multiple response (select all that apply) ── */
                          <div className="space-y-3">
                            <p className="text-xs text-gray-500">
                              Select all that apply.
                            </p>
                            {question.options.map((option, optionIndex) => {
                              const selectedArr =
                                (answers[question.id] as string[]) ?? [];
                              const isChecked = selectedArr.includes(option.id);
                              const isSubmitted =
                                submittedQuestions.has(currentQuestion);
                              const showRevealed =
                                isSubmitted || isExamSubmitted;
                              const correctSet = Array.isArray(
                                question.correctAnswer,
                              )
                                ? (question.correctAnswer as string[])
                                : [];
                              const isCorrectOption = correctSet.includes(
                                option.id,
                              );
                              const letter = String.fromCharCode(
                                65 + optionIndex,
                              );
                              return (
                                <div
                                  key={option.id}
                                  className={cn(
                                    "rounded-lg transition-colors [&>label]:w-full [&>label]:p-3",
                                    showRevealed && isCorrectOption
                                      ? "bg-green-50"
                                      : isSubmitted && isChecked
                                        ? "bg-red-50"
                                        : isChecked
                                          ? "bg-blue-50"
                                          : "hover:bg-gray-50",
                                    isCurrentFrozen
                                      ? "pointer-events-none opacity-60"
                                      : "cursor-pointer",
                                  )}
                                >
                                  <CheckBox
                                    value={isChecked}
                                    onChange={() =>
                                      !isCurrentFrozen &&
                                      handleSelectOption(option.id)
                                    }
                                    customLabel={
                                      <div className="flex items-center gap-3 flex-1 ml-2">
                                        <span
                                          className={cn(
                                            "text-xs font-bold w-5 shrink-0",
                                            showRevealed && isCorrectOption
                                              ? "text-green-600"
                                              : isSubmitted && isChecked
                                                ? "text-red-500"
                                                : "text-gray-400",
                                          )}
                                        >
                                          {letter}
                                        </span>
                                        <span
                                          className={cn(
                                            "text-sm flex-1",
                                            showRevealed && isCorrectOption
                                              ? "text-green-600"
                                              : isSubmitted && isChecked
                                                ? "text-red-500"
                                                : "text-gray-600",
                                          )}
                                        >
                                          <ContentRenderer
                                            content={option.text}
                                            variant="inline"
                                          />
                                        </span>
                                        {showRevealed && isCorrectOption && (
                                          <Icon
                                            icon="hugeicons:tick-01"
                                            className="w-5 h-5 text-green-800"
                                          />
                                        )}
                                        {isSubmitted &&
                                          !isCorrectOption &&
                                          isChecked && (
                                            <Icon
                                              icon="hugeicons:cancel-circle"
                                              className="w-5 h-5 text-red-500"
                                            />
                                          )}
                                      </div>
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : isMatching ? (
                          /* ── Matching ── */
                          <MatchingQuestion
                            prompts={question.matchingPrompts ?? []}
                            options={question.matchingOptions ?? []}
                            value={
                              (answers[question.id] as Record<
                                string,
                                string
                              >) ?? {}
                            }
                            onChange={(v) =>
                              setAnswers({ ...answers, [question.id]: v })
                            }
                            revealed={isCurrentFrozen}
                            correctAnswer={
                              question.correctAnswer as
                                | Record<string, string>
                                | undefined
                            }
                            disabled={isCurrentFrozen}
                          />
                        ) : (
                          /* ── Multiple choice / True-False ── */
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => {
                              const state = getOptionState(option.id);
                              const isSelected =
                                answers[question.id] === option.id;
                              const letter = String.fromCharCode(
                                65 + optionIndex,
                              );
                              return (
                                <label
                                  key={option.id}
                                  onClick={() =>
                                    !isCurrentFrozen &&
                                    handleSelectOption(option.id)
                                  }
                                  className={cn(
                                    "flex items-center gap-3 w-full text-left p-3 rounded-lg transition-colors",
                                    state === "correct" && "bg-green-50",
                                    state === "incorrect" && "bg-red-50",
                                    state === "default" &&
                                      isSelected &&
                                      "bg-blue-50",
                                    state === "default" &&
                                      !isSelected &&
                                      "hover:bg-gray-50",
                                    isCurrentFrozen
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer",
                                  )}
                                >
                                  <Radio
                                    name={`question-${currentQuestion}`}
                                    value={isSelected}
                                    state={
                                      state !== "default" ? state : undefined
                                    }
                                    onChange={() =>
                                      !isCurrentFrozen &&
                                      handleSelectOption(option.id)
                                    }
                                  />
                                  <span
                                    className={cn(
                                      "text-xs font-bold w-5 shrink-0",
                                      state === "correct" && "text-green-600",
                                      state === "incorrect" && "text-red-500",
                                      state === "default" && "text-gray-400",
                                    )}
                                  >
                                    {letter}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-sm",
                                      state === "correct" && "text-green-600",
                                      state === "incorrect" && "text-red-500",
                                      state === "default" && "text-gray-600",
                                    )}
                                  >
                                    <ContentRenderer
                                      content={option.text}
                                      variant="inline"
                                    />
                                  </span>
                                  {state === "correct" && (
                                    <Icon
                                      icon="hugeicons:tick-01"
                                      className="w-5 h-5 text-green-800 ml-auto"
                                    />
                                  )}
                                  {state === "incorrect" && (
                                    <Icon
                                      icon="hugeicons:cancel-circle"
                                      className="w-5 h-5 text-red-500 ml-auto"
                                    />
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Nav buttons — stacked on mobile, inline on sm+ */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-6">
                          {/* Secondary: Previous + Skip */}
                          <div className="flex gap-2">
                            <Button
                              variant="outlined"
                              onClick={handlePrevious}
                              disabled={currentQuestion === 1}
                              className="flex-1 sm:flex-none justify-center bg-white! border-[#D0D5DD]! text-[#344054]! hover:bg-[#F9FAFB]!"
                            >
                              Previous
                            </Button>
                            {!isExamSubmitted && !isAnswered && currentQuestion < totalQuestions && (
                              <Button
                                variant="outlined"
                                onClick={() => { const n = currentQuestion + 1; setCurrentQuestion(n); prefetchAround(n - 1); }}
                                className="flex-1 sm:flex-none justify-center bg-white! border-[#D0D5DD]! text-[#344054]! hover:bg-[#F9FAFB]!"
                              >
                                Skip
                              </Button>
                            )}
                          </div>
                          {/* Primary action */}
                          <div className="flex">
                            {isExamSubmitted ? (
                              currentQuestion === totalQuestions ? (
                                <Button onClick={handleReturnToMain} className="flex-1 sm:flex-none justify-center">
                                  Return to Main Window
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => { const n = currentQuestion + 1; setCurrentQuestion(n); prefetchAround(n - 1); }}
                                  className="flex-1 sm:flex-none justify-center"
                                >
                                  Next Question
                                </Button>
                              )
                            ) : !isAnswered ? (
                              <Button
                                onClick={handleSubmitAnswer}
                                disabled={(() => {
                                  const a = answers[question.id];
                                  if (a == null) return true;
                                  if (Array.isArray(a)) return a.length === 0;
                                  if (typeof a === "string") return a.trim() === "";
                                  if (typeof a === "object")
                                    return !Object.values(a as Record<string, string>).some(
                                      (v) => v?.trim() !== "",
                                    );
                                  return false;
                                })()}
                                className="flex-1 sm:flex-none justify-center"
                              >
                                Submit Answer
                              </Button>
                            ) : currentQuestion === totalQuestions ? (
                              <Button
                                onClick={() => setShowConfirmModal(true)}
                                loading={isSubmittingExam}
                                className="flex-1 sm:flex-none justify-center"
                              >
                                Finish Exam
                              </Button>
                            ) : (
                              <Button
                                onClick={() => { const n = currentQuestion + 1; setCurrentQuestion(n); prefetchAround(n - 1); }}
                                className="flex-1 sm:flex-none justify-center"
                              >
                                Next Question
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Mobile nav + calculator triggers */}
                        <div className="lg:hidden mt-3 flex gap-2">
                          <button
                            onClick={() => setShowNavigation(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F2F4F7] text-[#344054] text-sm font-medium"
                          >
                            <Icon icon="hugeicons:menu-02" className="w-4 h-4 shrink-0" />
                            <span className="whitespace-nowrap">Test Navigation</span>
                          </button>
                          <button
                            onClick={() => setShowCalculatorModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F2F4F7] text-[#344054] text-sm font-medium"
                          >
                            <Icon icon="hugeicons:calculator" className="w-4 h-4 shrink-0" />
                            Calculator
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isExamSubmitted &&
                    question &&
                    (question.topicName || question.explanation) && (
                      <div
                        style={{
                          boxShadow:
                            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                        }}
                        className="border-[#258BE4] rounded-xl border p-[1.25rem_1.375rem_2rem_1.25rem] bg-[#DBEDFF] overflow-hidden"
                      >
                        <div className="flex flex-col md:flex-row items-start md:justify-between">
                          <h3 className="font-semibold text-gray-900">
                            Explanation
                          </h3>
                          {question.explanation && (
                            <button
                              onClick={handleShowFullDetails}
                              className="text-[#E32E89] text-sm font-medium hover:underline flex items-center gap-1 mt-2 md:mt-0"
                            >
                              Full Description Here
                              <Icon
                                icon="hugeicons:arrow-right-01"
                                className="w-4 h-4"
                              />
                            </button>
                          )}
                        </div>

                        {question.correctAnswer && (
                          <>
                            <div className="h-[1px] w-full bg-[#EDEDED] my-4" />
                            {question.type === "multiple_choice" ||
                            question.type === "true_false" ? (
                              <p className="font-semibold text-blue-600">
                                Correct answer is{" "}
                                {getCorrectAnswerLetter(question)}
                              </p>
                            ) : (
                              <>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                  Right Answer
                                </h4>
                                <p className="text-lg font-bold text-blue-600">
                                  <ContentRenderer
                                    content={getCorrectAnswerDisplay(question)}
                                    variant="inline"
                                  />
                                </p>
                              </>
                            )}
                          </>
                        )}

                        {question.explanation && (
                          <>
                            <div className="h-[1px] w-full bg-[#EDEDED] my-4" />
                            <div className="text-gray-600 text-sm leading-relaxed">
                              <ContentRenderer content={question.explanation!} contentFormat={question.contentFormat} />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                </div>

                <Disclaimer />
              </div>

              {/* Right — sidebar */}
              <div className="hidden lg:block">
                <div
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                  }}
                  className="bg-white rounded-[1.5rem] p-[2rem_1rem]"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Test Navigation
                    </h3>
                    <button
                      onClick={() => setIsNavigationMinimized((prev) => !prev)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Icon
                        icon="hugeicons:arrow-down-01"
                        className={cn(
                          "w-5 h-5 transition-transform",
                          isNavigationMinimized && "rotate-180",
                        )}
                      />
                    </button>
                  </div>

                  {!isNavigationMinimized && (
                    <>
                      <hr className="mt-4 text-[#DCDFE4]" />

                      <div className="flex gap-3 my-8">
                        {!hideScore && (
                          <div className="flex-1 flex flex-col items-center border p-[0.75rem_0.5rem] bg-[#F3F3F3] rounded-[1rem] text-[#E32E89] border-[#E32E89] gap-1">
                            <span className="text-[1rem] tracking-[-.32px] font-[600]">
                              Score
                            </span>
                            <span className="text-[1.5rem] tracking-[-.48px] font-[500]">
                              {isExamSubmitted && examResult
                                ? Math.round(examResult.scorePercentage)
                                : score}
                              %
                            </span>
                          </div>
                        )}
                        <div className="flex-1 flex flex-col items-center border p-[0.75rem_0.5rem] bg-[#F3F3F3] rounded-[1rem] text-[#E32E89] border-[#E32E89] gap-1">
                          <span className="text-[1rem] tracking-[-.32px] font-[600]">
                            Time
                          </span>
                          <span className="text-[1.5rem] tracking-[-.48px] font-[500]">
                            {isExamSubmitted
                              ? "Done"
                              : timeLeft !== null
                                ? formatTime(timeLeft)
                                : "--:--:--"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {Array.from(
                          { length: totalQuestions },
                          (_, i) => i + 1,
                        ).map((num) => (
                          <div key={num} className="relative">
                            <button
                              onClick={() => {
                                setCurrentQuestion(num);
                                prefetchAround(num - 1);
                              }}
                              className={cn(
                                "w-8 h-8 rounded-lg text-sm font-medium transition-colors border",
                                getButtonStyle(num),
                                flaggedQuestions.has(
                                  getQuestion(num - 1)?.id ?? "",
                                ) && "border-b-4 border-red-500",
                              )}
                            >
                              {num}
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={
                          isExamSubmitted
                            ? handleReturnToMain
                            : () => setShowConfirmModal(true)
                        }
                        className="text-blue-500 text-sm font-medium hover:underline"
                      >
                        {isExamSubmitted
                          ? "Return to Main Window"
                          : "Finish Exam…"}
                      </button>
                    </>
                  )}
                </div>

                <Calculator />
              </div>
            </div>


            {showNavigation && (
              <div
                className="fixed inset-0 bg-black/50 z-50 lg:hidden flex items-end"
                onClick={() => { setNavDragY(0); setShowNavigation(false); }}
              >
                <div
                  className="bg-white rounded-t-2xl w-full p-4 pb-8 max-h-[75vh] overflow-y-auto"
                  style={{ transform: `translateY(${navDragY}px)`, transition: navDragY > 0 ? "none" : "transform 0.3s ease" }}
                  onTouchStart={(e) => { navDragStartY.current = e.touches[0].clientY; }}
                  onTouchMove={(e) => { const d = e.touches[0].clientY - navDragStartY.current; if (d > 0) setNavDragY(d); }}
                  onTouchEnd={() => { if (navDragY > 80) setShowNavigation(false); setNavDragY(0); }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Test Navigation</h3>
                    <button onClick={() => setShowNavigation(false)} className="text-gray-400 hover:text-gray-600">
                      <Icon icon="hugeicons:cancel-01" className="w-5 h-5" />
                    </button>
                  </div>
                  <hr className="mb-4 text-[#DCDFE4]" />
                  <div className="flex gap-3 mb-4">
                    {!hideScore && (
                      <>
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm text-gray-600">Score</span>
                          <span className="text-lg font-bold text-[#E32E89]">
                            {isExamSubmitted && examResult ? Math.round(examResult.scorePercentage) : score}%
                          </span>
                        </div>
                        <div className="w-px bg-gray-200" />
                      </>
                    )}
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Time</span>
                      <span className="text-sm font-bold text-[#E32E89]">
                        {isExamSubmitted ? "Done" : timeLeft !== null ? formatTime(timeLeft) : "--:--:--"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
                      <div key={num} className="relative">
                        <button
                          onClick={() => { setCurrentQuestion(num); prefetchAround(num - 1); setShowNavigation(false); }}
                          className={cn(
                            "w-8 h-8 rounded-lg text-sm font-medium transition-colors border",
                            getButtonStyle(num),
                            flaggedQuestions.has(getQuestion(num - 1)?.id ?? "") && "border-b-4 border-red-500",
                          )}
                        >
                          {num}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={isExamSubmitted ? handleReturnToMain : () => setShowConfirmModal(true)}
                    className="text-[#007FFF] text-sm font-medium hover:underline"
                  >
                    {isExamSubmitted ? "Return to Main Window" : "Finish Exam…"}
                  </button>
                </div>
              </div>
            )}

            {showCalculatorModal && (
              <div
                className="fixed inset-0 bg-black/50 z-50 lg:hidden flex items-end"
                onClick={() => setShowCalculatorModal(false)}
              >
                <div
                  className="bg-white rounded-t-2xl w-full p-4 pb-8 max-h-[85vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Calculator</h3>
                    <button onClick={() => setShowCalculatorModal(false)} className="text-gray-400 hover:text-gray-600">
                      <Icon icon="hugeicons:cancel-01" className="w-5 h-5" />
                    </button>
                  </div>
                  <Calculator />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Confirm Submit Modal ── */}
      {showConfirmModal && (
        <Modal isOpen className="rounded-2xl w-full max-w-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Finish Exam?
              </h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="hugeicons:cancel-01" className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4 sm:mb-6">
              Once submitted you cannot change your answers. You&apos;ll be able
              to review the exam in read-only mode.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outlined"
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:w-auto justify-center"
              >
                Go Back
              </Button>
              <Button loading={isSubmittingExam} onClick={handleConfirmSubmit} className="w-full sm:w-auto justify-center">
                Yes, Submit
              </Button>
            </div>
        </Modal>
      )}

      {/* ── Leave Exam Modal ── */}
      {showLeaveModal && (
        <Modal isOpen className="rounded-2xl w-full max-w-md p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              Leave Exam?
            </h2>
            <p className="text-sm text-gray-500 mb-4 sm:mb-6">
              Your progress will be lost if you leave now. Submit first to save
              your results.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button variant="outlined" onClick={dismissLeaveModal} className="w-full sm:w-auto justify-center">
                Stay in Exam
              </Button>
              <Button
                className="w-full sm:w-auto justify-center"
                onClick={() => {
                  dismissLeaveModal();
                  handleReturnToMain();
                }}
              >
                Leave Without Submitting
              </Button>
            </div>
        </Modal>
      )}

      {/* ── Explanation Modal ── */}
      {showFullDetails && (
        <Modal isOpen onClose={() => setShowFullDetails(false)} className="rounded-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Explanation
              </h2>
              <button
                onClick={() => setShowFullDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="hugeicons:cancel-01" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {fullDetailsTopic && (
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Topic
                  </p>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {fullDetailsTopic}
                    </h3>
                    {fullDetailsTopicId && (
                      <Link
                        href={`/student/topics/${fullDetailsTopicId}`}
                        target="_blank"
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        View Topic
                        <Icon
                          icon="hugeicons:arrow-right-01"
                          className="w-3.5 h-3.5"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              )}
              <div className="text-gray-700 leading-relaxed">
                <ContentRenderer content={fullDetailsContent} />
              </div>
              <div className="flex justify-end mt-4 sm:mt-6">
                <button
                  onClick={() => setShowFullDetails(false)}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
        </Modal>
      )}
    </>
  );
}
