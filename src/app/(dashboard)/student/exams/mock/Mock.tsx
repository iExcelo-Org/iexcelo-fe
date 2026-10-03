"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { useExamStore, useAuthStore } from "@/store";
import type { IQuestionResponse, IFlagUpdate } from "@/types";

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

function MockSkeleton() {
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

export default function Mock() {
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
    mockConfig,
    getQuestion,
    getPassage,
    prefetchAround,
    loadingPages,
  } = useExamStore();

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | Record<string, string>>
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
  const [showReview, setShowReview] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  useExamProtection(!showResults && !showInstructions);
  const { showLeaveModal, dismissLeaveModal } = useExamLeaveGuard(!showResults && !showInstructions);

  // Seed flaggedQuestions from previously flagged IDs when session loads
  useEffect(() => {
    if (examSession?.flaggedQuestionIds?.length) {
      setFlaggedQuestions(new Set(examSession.flaggedQuestionIds));
    }
  }, [examSession?.examAttemptId, examSession?.flaggedQuestionIds]);

  // Initialize countdown timer once exam session is available
  useEffect(() => {
    if (examSession && timeLeft === null) {
      setTimeLeft(examSession.timeLimitSeconds ?? 95 * 60);
    }
  }, [examSession, timeLeft]);

  // Stable submit handler — used by both button and timer auto-submit
  const handleFinalSubmit = useCallback(async () => {
    const elapsed = examSession
      ? Math.floor(
          (Date.now() - new Date(examSession.startedAt).getTime()) / 1000,
        )
      : 0;
    // Build from answers dict — works regardless of pagination
    const responses: IQuestionResponse[] = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId,
        answer,
        timeSpent: 0,
        isFlagged: flaggedQuestions.has(questionId),
      }),
    );
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
    setShowReview(false);
    setShowResults(true);
  }, [examSession, answers, flaggedQuestions, submitExam]);

  // Countdown timer — only active after exam starts (isLoading === false)
  useEffect(() => {
    if (isLoading || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isLoading, handleFinalSubmit]);

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

  // Session guard — must come AFTER all hooks
  if (!isNavigatingAway.current && !pendingConfig && !examSession) {
    return <MockSkeleton />;
  }

  const totalQuestions =
    examSession?.totalCount ?? mockConfig?.standardQuestionCount ?? 0;
  const examTypeName =
    examSession?.examTypeName ?? pendingConfig?.examTypeName ?? "";
  const subjectNames =
    examSession?.subjectNames ?? pendingConfig?.subjectNames ?? [];
  const userName = user?.firstName ?? "Student";
  const timeLimitSeconds =
    examSession?.timeLimitSeconds ??
    (mockConfig ? mockConfig.standardDurationMinutes * 60 : 95 * 60);

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

  // Answered count from the answers dict (works across all pages)
  const answeredCount = Object.values(answers).filter((a) => {
    if (a == null) return false;
    if (Array.isArray(a)) return a.length > 0;
    if (typeof a === "string") return a.trim() !== "";
    return Object.values(a as Record<string, string>).some(
      (v) => v?.trim() !== "",
    );
  }).length;

  const handleSelectOption = (optionId: string) => {
    if (!question) return;
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

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      const next = currentQuestion - 1;
      setCurrentQuestion(next);
      prefetchAround(next - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      const next = currentQuestion + 1;
      setCurrentQuestion(next);
      prefetchAround(next - 1);
    } else setShowReview(true);
  };

  const handleToggleFlag = () => {
    if (!question) return;
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(question.id)) newFlagged.delete(question.id);
    else newFlagged.add(question.id);
    setFlaggedQuestions(newFlagged);
  };

  const handleFinish = () => setShowReview(true);
  const handleReturnToAttempt = () => setShowReview(false);

  const handleReturnToMain = () => {
    isNavigatingAway.current = true;
    shouldClearRef.current = true;
    router.push("/student/exams");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAttemptTest = async () => {
    await startExam();
    setIsLoading(false);
    setShowInstructions(false);
  };

  const getButtonStyle = (num: number) => {
    const q = examSession?.questions[num - 1];
    if (q && answers[q.id]) return "bg-gray-500 text-white";
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
        correctAnswers={examResult?.correctAnswers ?? 0}
        incorrectAnswers={examResult?.wrongAnswers ?? 0}
        unattempted={examResult?.unanswered ?? totalQuestions - answeredCount}
        score={examResult?.scorePercentage ?? 0}
        hideScore={
          examSession?.category === "theory" ||
          examSession?.category === "practical"
        }
        timeUsed={
          examResult?.timeSpentSeconds != null
            ? formatTimeUsed(examResult.timeSpentSeconds)
            : undefined
        }
        onReturnToMain={handleReturnToMain}
      />
    );
  }

  const sharedSidebar = (onPillClick: (num: number) => void) => (
    <div className="hidden lg:block">
      <div
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="bg-white rounded-[1.5rem] p-[2rem_1rem]"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Test Navigation</h3>
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

            <div className="my-8">
              <div className="flex w-fit mx-auto flex-col items-center border p-[1rem_2rem] bg-[#F3F3F3] rounded-[1rem] text-[#E32E89] border-[#E32E89] gap-2">
                <span className="text-[1.5rem] tracking-[-.48px] leading-8 font-[600]">
                  Time Left
                </span>
                <span className="text-[2.25rem] tracking-[-.72px] leading-11 font-[500]">
                  {timeLeft !== null ? formatTime(timeLeft) : "--:--:--"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
                (num) => (
                  <div key={num} className="relative">
                    <button
                      onClick={() => onPillClick(num)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-sm font-medium transition-colors border",
                        getButtonStyle(num),
                        flaggedQuestions.has(getQuestion(num - 1)?.id ?? "") &&
                          "border-b-4 border-red-500",
                      )}
                    >
                      {num}
                    </button>
                  </div>
                ),
              )}
            </div>

            {showReview ? (
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmittingExam}
                className="text-blue-500 text-sm font-medium hover:underline disabled:opacity-50"
              >
                Submit all and finish...
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="text-blue-500 text-sm font-medium hover:underline"
              >
                Finish attempt and Review...
              </button>
            )}
          </>
        )}
      </div>

      <Calculator />
    </div>
  );

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
        <MockSkeleton />
      ) : showReview ? (
        /* ── Review / Summary screen ── */
        <section className="bg-white p-4 md:p-6 select-none">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left — summary area */}
              <div className="lg:col-span-2 pb-8">
                <div
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                  }}
                  className="bg-white rounded-[1.5rem] overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 sm:p-6 border-b border-[#EDEDED]">
                    <h2 className="font-[600] text-[.9375rem] sm:text-[1.125rem] text-[#2B2B2B] mb-0.5">
                      {examTypeName}
                    </h2>
                    <p className="text-[.8125rem] sm:text-[.9375rem] text-[#757575]">
                      {subjectNames.join(", ")}
                    </p>
                  </div>

                  {/* Stats bar */}
                  <div className="grid grid-cols-3 divide-x divide-[#EDEDED] border-b border-[#EDEDED] bg-[#FAFAFA]">
                    <div className="p-3 sm:p-4 text-center">
                      <p className="text-[1.125rem] sm:text-[1.375rem] font-[700] text-[#2B2B2B]">{totalQuestions}</p>
                      <p className="text-[.6875rem] sm:text-[.75rem] text-[#757575] mt-0.5">Total</p>
                    </div>
                    <div className="p-3 sm:p-4 text-center">
                      <p className="text-[1.125rem] sm:text-[1.375rem] font-[700] text-[#0F973D]">{answeredCount}</p>
                      <p className="text-[.6875rem] sm:text-[.75rem] text-[#757575] mt-0.5">Answered</p>
                    </div>
                    <div className="p-3 sm:p-4 text-center">
                      <p className="text-[1.125rem] sm:text-[1.375rem] font-[700] text-[#D42620]">{totalQuestions - answeredCount}</p>
                      <p className="text-[.6875rem] sm:text-[.75rem] text-[#757575] mt-0.5">Unanswered</p>
                    </div>
                  </div>

                  {/* Section label */}
                  <div className="px-4 sm:px-6 py-2.5 bg-[#FFF5FA] border-b border-[#EDEDED]">
                    <span className="text-[.8125rem] sm:text-[.875rem] font-[600] text-[#E32E89]">
                      Summary of Attempts
                    </span>
                  </div>

                  {/* Question list */}
                  <div className="max-h-[26rem] overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-white border-b border-[#EDEDED]">
                        <tr>
                          <th className="text-left w-14 sm:w-16 p-[.75rem_.875rem] sm:p-[.875rem_1.25rem] text-[.8125rem] sm:text-[.875rem] font-[600] text-[#2B2B2B]">
                            No.
                          </th>
                          <th className="text-left p-[.75rem_.875rem] sm:p-[.875rem_1.25rem] text-[.8125rem] sm:text-[.875rem] font-[600] text-[#2B2B2B]">
                            Question
                          </th>
                          <th className="text-left p-[.75rem_.875rem] sm:p-[.875rem_1.25rem] text-[.8125rem] sm:text-[.875rem] font-[600] text-[#2B2B2B]">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(
                          { length: totalQuestions },
                          (_, i) => i + 1,
                        ).map((num) => {
                          const q = getQuestion(num - 1);
                          const isAnswered = q ? !!answers[q.id] : false;
                          const isFlagged = flaggedQuestions.has(q?.id ?? "");
                          return (
                            <tr
                              key={num}
                              className={cn(
                                "border-b border-[#EDEDED] last:border-0",
                                num % 2 === 0 ? "bg-[#FAFAFA]" : "bg-white",
                              )}
                            >
                              <td className="p-[.75rem_.875rem] sm:p-[.875rem_1.25rem] text-[.875rem] font-[600] text-[#007FFF]">
                                {num}
                              </td>
                              <td className="p-[.75rem_.875rem] sm:p-[.875rem_1.25rem]">
                                <span className="text-[.875rem] text-[#2B2B2B]">Question {num}</span>
                                {isFlagged && (
                                  <span className="ml-2 inline-flex items-center gap-1 text-[.6875rem] text-pink-500 bg-pink-50 border border-pink-100 px-1.5 py-0.5 rounded-full">
                                    <Icon icon="hugeicons:flag-02" className="w-3 h-3" />
                                    Flagged
                                  </span>
                                )}
                              </td>
                              <td className="p-[.75rem_.875rem] sm:p-[.875rem_1.25rem]">
                                {isAnswered ? (
                                  <span className="inline-flex items-center gap-1.5 text-[.75rem] sm:text-[.8125rem] text-[#0F973D] bg-[#F0FAF4] border border-[#D3F0DC] px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F973D] shrink-0" />
                                    Answered
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-[.75rem] sm:text-[.8125rem] text-[#D42620] bg-[#FEF3F2] border border-[#FECDCA] px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D42620] shrink-0" />
                                    Skipped
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Action buttons */}
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 border-t border-[#EDEDED]">
                    <Button variant="outlined" onClick={handleReturnToAttempt} className="w-full sm:w-auto justify-center">
                      Return to Attempt
                    </Button>
                    <Button
                      onClick={handleFinalSubmit}
                      loading={isSubmittingExam}
                      className="w-full sm:w-auto justify-center"
                    >
                      Submit all and finish
                    </Button>
                  </div>
                </div>

                <Disclaimer />
              </div>

              {/* Right — sidebar (pills navigate back to exam) */}
              {sharedSidebar((num) => {
                setCurrentQuestion(num);
                setShowReview(false);
              })}
            </div>

            {/* Mobile nav trigger for review screen */}
            <div className="lg:hidden mt-4 flex justify-center">
              <button
                onClick={() => setShowNavigation(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F2F4F7] text-[#344054] text-sm font-medium"
              >
                <Icon icon="hugeicons:menu-02" className="w-4 h-4" />
                Test Navigation
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* ── Exam questions screen ── */
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
                          className={cn(
                            "p-2.5 flex items-center justify-center rounded-[1.25rem] transition-colors",
                            question && flaggedQuestions.has(question.id)
                              ? "bg-pink-100 text-pink-500 hover:bg-pink-200"
                              : "bg-gray-100 text-[#454545] hover:bg-gray-200",
                          )}
                        >
                          <Icon icon="hugeicons:flag-02" className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pt-5">
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
                            value={(answers[question.id] as string) ?? ""}
                            onChange={(e: { target: { name?: string; value: any } }) =>
                              setAnswers({
                                ...answers,
                                [question.id]: e.target.value,
                              })
                            }
                          />
                        ) : isTextInput ? (
                          /* ── Fill in the blank / Short answer ── */
                          <input
                            type="text"
                            value={(answers[question.id] as string) ?? ""}
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                [question.id]: e.target.value,
                              })
                            }
                            placeholder="Type your answer here…"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
                          />
                        ) : isMultipleResponse ? (
                          /* ── Multiple response (select all that apply) ── */
                          <div className="space-y-3">
                            <p className="text-xs text-gray-500">
                              Select all that apply.
                            </p>
                            {question.options.map((option) => {
                              const selectedArr =
                                (answers[question.id] as string[]) ?? [];
                              const isChecked = selectedArr.includes(option.id);
                              return (
                                <div
                                  key={option.id}
                                  className={cn(
                                    "rounded-lg transition-colors [&>label]:w-full [&>label]:p-3 cursor-pointer",
                                    isChecked
                                      ? "bg-blue-50"
                                      : "hover:bg-gray-50",
                                  )}
                                >
                                  <CheckBox
                                    value={isChecked}
                                    onChange={() =>
                                      handleSelectOption(option.id)
                                    }
                                    customLabel={
                                      <span className="text-sm text-gray-600 ml-2">
                                        <ContentRenderer
                                          content={option.text}
                                          variant="inline"
                                        />
                                      </span>
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
                          />
                        ) : (
                          /* ── Multiple choice / True-False ── */
                          <div className="space-y-3">
                            {question.options.map((option) => (
                              <label
                                key={option.id}
                                onClick={() => handleSelectOption(option.id)}
                                className={cn(
                                  "flex items-center gap-3 w-full text-left p-3 rounded-lg transition-colors cursor-pointer",
                                  answers[question.id] === option.id
                                    ? "bg-blue-50"
                                    : "hover:bg-gray-50",
                                )}
                              >
                                <Radio
                                  name={`question-${currentQuestion}`}
                                  value={answers[question.id] === option.id}
                                  onChange={() => handleSelectOption(option.id)}
                                />
                                <span className="text-sm text-gray-600">
                                  <ContentRenderer
                                    content={option.text}
                                    variant="inline"
                                  />
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 mt-6">
                          <Button
                            variant="outlined"
                            onClick={handlePrevious}
                            disabled={currentQuestion === 1}
                            className="flex-1 sm:flex-none justify-center bg-white! border-[#D0D5DD]! text-[#344054]! hover:bg-[#F9FAFB]!"
                          >
                            Previous
                          </Button>
                          <Button onClick={handleNext} className="flex-1 sm:flex-none justify-center">
                            {currentQuestion === totalQuestions ? "Finish" : "Next"}
                          </Button>
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
                </div>

                <Disclaimer />
              </div>

              {/* Right — sidebar */}
              {sharedSidebar((num) => {
                setCurrentQuestion(num);
                prefetchAround(num - 1);
              })}
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
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Time Left</span>
                    <span className="text-lg font-bold text-[#E32E89]">
                      {timeLeft !== null ? formatTime(timeLeft) : "--:--:--"}
                    </span>
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
                    onClick={() => { setShowNavigation(false); handleFinish(); }}
                    className="text-[#007FFF] text-sm font-medium hover:underline"
                  >
                    Finish attempt and Review...
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
    </>
  );
}
