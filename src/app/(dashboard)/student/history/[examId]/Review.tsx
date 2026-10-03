"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Button, Tab, ContentRenderer, Radio, CheckBox } from "@/components/atoms";
import { Chart } from "@/components/molecules";
import { MatchingQuestion } from "@/components/molecules/student-dashboard";
import { useAuthStore, useStudentStore } from "@/store";
import { formatDateTime, formatTimeFromSeconds, capitalize } from "@/utils";
import { useExamProtection } from "@/hooks";
import type { IDetailedResult, IQuestionStatus } from "@/types";

// ── Theme colors ──────────────────────────────────────────────────────────────
const COLOR_CORRECT = "#099137";
const COLOR_INCORRECT = "#D42620";
const COLOR_UNANSWERED = "#F3A218";
const COLOR_ESSAY = "#007FFF";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getModeIcon(mode: string) {
  const m = mode.toLowerCase();
  if (m === "revision")
    return {
      icon: "hugeicons:pencil-edit-02",
      color: "#007FFF",
      bg: "#EBF5FF",
      label: "Revision Mode",
    };
  if (m === "timed")
    return {
      icon: "hugeicons:clock-01",
      color: "#865503",
      bg: "#FEF6E7",
      label: "Timed Mode",
    };
  return {
    icon: "hugeicons:checkmark-circle-01",
    color: "#036B26",
    bg: "#E7F6EC",
    label: "Mock Mode",
  };
}

function getQuestionType(type: string) {
  return {
    isEssay: type === "essay",
    isFillInBlank: type === "fill_in_the_blank",
    isShortAnswer: type === "short_answer",
    isMultipleResponse: type === "multiple_response",
    isMatching: type === "matching",
    isTextInput: type === "fill_in_the_blank" || type === "short_answer",
  };
}

type OptionState =
  | "correct-picked"
  | "correct-missed"
  | "wrong-picked"
  | "default";

function getOptionState(
  optionId: string,
  question: IDetailedResult,
): OptionState {
  const { correctAnswer, studentAnswer } = question;
  const correctSet = Array.isArray(correctAnswer)
    ? (correctAnswer as string[])
    : correctAnswer != null
      ? [correctAnswer as string]
      : [];
  const studentSet = Array.isArray(studentAnswer)
    ? (studentAnswer as string[])
    : studentAnswer != null
      ? [studentAnswer as string]
      : [];

  const isCorrect = correctSet.includes(optionId);
  const isPicked = studentSet.includes(optionId);

  if (isCorrect && isPicked) return "correct-picked";
  if (isCorrect && !isPicked) return "correct-missed";
  if (!isCorrect && isPicked) return "wrong-picked";
  return "default";
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ReviewSkeleton() {
  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto animate-pulse">
      <div className="mb-5 sm:mb-8 flex items-center gap-3 sm:gap-4">
        <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-200 rounded-full" />
        <div className="h-6 sm:h-7 bg-gray-200 rounded w-36 sm:w-48" />
      </div>
      {/* Tabs */}
      <div className="flex gap-4 sm:gap-6 border-b border-[#E4E7EC] mb-6">
        <div className="h-4 sm:h-5 bg-gray-200 rounded w-20 sm:w-24 mb-2" />
        <div className="h-4 sm:h-5 bg-gray-200 rounded w-32 sm:w-40 mb-2" />
      </div>
      {/* Overview skeleton */}
      <div
        style={{
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)",
        }}
        className="p-4 sm:p-6 bg-white rounded-[1rem] mb-6"
      >
        <div className="h-4 sm:h-5 bg-gray-200 rounded w-28 sm:w-36 mb-4 sm:mb-6" />
        <div className="flex flex-col sm:flex-row justify-between gap-5 sm:gap-8">
          <div className="flex-1 space-y-3 sm:space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 sm:gap-4">
                <div className="h-3.5 sm:h-4 bg-gray-200 rounded w-24 sm:w-32" />
                <div className="h-3.5 sm:h-4 bg-gray-100 rounded w-36 sm:w-48" />
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-3 sm:space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 sm:gap-4">
                <div className="h-3.5 sm:h-4 bg-gray-200 rounded w-24 sm:w-32" />
                <div className="h-3.5 sm:h-4 bg-gray-100 rounded w-16 sm:w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)",
          }}
          className="flex-1 p-4 sm:p-6 bg-white rounded-[1rem] h-[16rem] sm:h-[22rem]"
        />
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)",
          }}
          className="flex-1 p-4 sm:p-6 bg-white rounded-[1rem] h-[16rem] sm:h-[22rem]"
        />
      </div>
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const Review = () => {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const {
    examAttemptDetail,
    isLoadingAttemptDetail,
    fetchExamAttemptDetail,
    reviewLoadingPages,
    prefetchReviewAround,
    getReviewQuestion,
  } = useStudentStore();

  const examId = params.examId as string;
  useExamProtection(true, false);

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [fullDetailsTopic, setFullDetailsTopic] = useState("");
  const [fullDetailsTopicId, setFullDetailsTopicId] = useState<string | null>(
    null,
  );
  const [fullDetailsContent, setFullDetailsContent] = useState("");

  useEffect(() => {
    if (!accessToken || !examId) return;
    fetchExamAttemptDetail(examId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, examId]);

  // Reset question navigator when attempt changes
  useEffect(() => {
    setCurrentQuestion(1);
  }, [examAttemptDetail?.id]);

  if (isLoadingAttemptDetail || !examAttemptDetail) {
    return <ReviewSkeleton />;
  }

  const {
    mode,
    examTypeName,
    subjectNames,
    totalQuestions,
    totalCount,
    correctAnswers,
    wrongAnswers,
    unanswered,
    essayQuestions,
    scorePercentage,
    timeSpentSeconds,
    timeLimitSeconds,
    startedAt,
    category,
    questionStatuses,
  } = examAttemptDetail;

  const hideScore = category === "theory" || category === "practical";

  const modeInfo = getModeIcon(mode);

  // Pie chart data
  const pieData = [
    { name: "Correct", value: correctAnswers, fill: COLOR_CORRECT },
    { name: "Incorrect", value: wrongAnswers, fill: COLOR_INCORRECT },
    { name: "Unanswered", value: unanswered, fill: COLOR_UNANSWERED },
    ...(essayQuestions > 0
      ? [{ name: "Essay (ungraded)", value: essayQuestions, fill: COLOR_ESSAY }]
      : []),
  ].filter((d) => d.value > 0);

  const timeUsed =
    timeSpentSeconds > 0 ? formatTimeFromSeconds(timeSpentSeconds) : "N/A";

  const timeLimitDisplay = timeLimitSeconds
    ? formatTimeFromSeconds(timeLimitSeconds)
    : "N/A";

  // ── Current question via page cache ──
  const questionIndex = currentQuestion - 1;
  const currentPage = Math.floor(questionIndex / 20);
  const isPageLoading = Array.isArray(reviewLoadingPages)
    ? reviewLoadingPages.includes(currentPage)
    : false;
  const question = getReviewQuestion(questionIndex);

  const navigateTo = (num: number) => {
    setCurrentQuestion(num);
    prefetchReviewAround(examId, num - 1);
  };

  const handleShowFullDetails = (q: IDetailedResult) => {
    setFullDetailsTopic(q.topicName ?? "");
    setFullDetailsTopicId(q.topicId ?? null);
    setFullDetailsContent(q.explanation ?? "");
    setShowFullDetails(true);
  };

  const getQuestionPillStyle = (
    status: IQuestionStatus | undefined,
    index: number,
  ) => {
    const isCurrent = index + 1 === currentQuestion;

    let bg = "bg-gray-100 text-gray-600 hover:bg-gray-200";
    if (status) {
      if (status.exemptFromMetrics) {
        bg = "bg-blue-100 text-blue-700";
      } else if (status.isCorrect === true) {
        bg = "bg-green-100 text-green-700";
      } else if (status.isCorrect === false) {
        bg = "bg-red-100 text-red-700";
      } else {
        bg = "bg-amber-50 text-amber-600";
      }
    }

    return cn(
      "w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[.625rem] sm:text-xs font-semibold flex items-center justify-center cursor-pointer transition-all",
      bg,
      isCurrent && "ring-2 ring-offset-1 ring-[#007FFF]",
    );
  };

  return (
    <>
      <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
        {/* Header */}
        <div className="mb-5 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push("/student/history")}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
            >
              <Icon
                icon="hugeicons:arrow-left-01"
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#2B2B2B]"
              />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-[600] text-[#171717]">
                Exam Review
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                {examTypeName} &mdash; {capitalize(mode)} Mode
              </p>
            </div>
          </div>
        </div>

        <Tab
          tabs={["Overview", "Exam Questions & Answers"]}
          tabChildren={[
            /* ── TAB 1: Overview ─────────────────────────────────────────── */
            <section key="overview" className="pt-6">
              {/* Exam Details Card */}
              <div
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                }}
                className="p-4 sm:p-6 bg-white rounded-[1rem]"
              >
                <div className="flex pb-3 sm:pb-4 items-center gap-[.75rem] sm:gap-[1rem]">
                  <span
                    style={{ boxShadow: "0 3px 14px 0 rgba(0, 0, 0, 0.08)" }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-[50%] flex items-center justify-center shrink-0"
                  >
                    <Icon
                      icon="hugeicons:book-04"
                      className="w-5 h-5 sm:w-6 sm:h-6 text-[#2B2B2B]"
                    />
                  </span>
                  <span className="text-[#2B2B2B] leading-6 sm:leading-7 text-[.9375rem] sm:text-[1.125rem] font-[500]">
                    Exam Details
                  </span>
                </div>

                <hr className="h-[1px] my-2.5 text-[#EDEDED]" />

                <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6 mt-3 sm:mt-4">
                  {/* Left column */}
                  <div className="flex flex-1 justify-between flex-col gap-[.75rem] sm:gap-[1rem]">
                    <div className="flex gap-[.5rem] sm:gap-[1rem] items-start">
                      <span className="text-[#454545] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[400] shrink-0">
                        Subject(s):
                      </span>
                      <span className="text-[#2B2B2B] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[500]">
                        {subjectNames?.length > 0
                          ? subjectNames.join(", ")
                          : "—"}
                      </span>
                    </div>
                    <div className="flex gap-[.5rem] sm:gap-[1rem] items-center">
                      <span className="text-[#454545] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[400]">
                        Exam Type:
                      </span>
                      <span className="text-[#2B2B2B] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[500]">
                        {examTypeName}
                      </span>
                    </div>
                    <div className="flex gap-[.5rem] sm:gap-[1rem] items-center">
                      <span className="text-[#454545] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[400]">
                        Date Attempted:
                      </span>
                      <span className="text-[#2B2B2B] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[500]">
                        {formatDateTime(startedAt)}
                      </span>
                    </div>
                    <div className="flex gap-[.5rem] sm:gap-[1rem] items-start">
                      <span className="text-[#454545] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[400]">
                        Time Used:
                      </span>
                      <span className="text-[#2B2B2B] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[500]">
                        {timeUsed}
                      </span>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="flex flex-1 justify-between flex-col gap-[.75rem] sm:gap-[1rem]">
                    <div className="flex gap-[.5rem] sm:gap-[1rem] items-center">
                      <span className="text-[#454545] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[400]">
                        Total Questions:
                      </span>
                      <span className="text-[#2B2B2B] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[500]">
                        {totalQuestions}
                      </span>
                    </div>
                    {!hideScore && (
                      <div className="flex gap-[.5rem] sm:gap-[1rem] items-center">
                        <span className="text-[#454545] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[400]">
                          Score:
                        </span>
                        <span
                          className={cn(
                            "leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[600]",
                            scorePercentage >= 50
                              ? "text-[#036B26]"
                              : "text-[#D42620]",
                          )}
                        >
                          {scorePercentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <div className="flex gap-[.5rem] sm:gap-[1rem] items-center">
                      <span className="text-[#454545] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[400]">
                        Exam Mode:
                      </span>
                      <span
                        style={{
                          color: modeInfo.color,
                          backgroundColor: modeInfo.bg,
                        }}
                        className="py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-[9999px] leading-6 sm:leading-7 text-[.8125rem] sm:text-[1rem] flex gap-[.375rem] items-center font-[500]"
                      >
                        <Icon
                          icon={modeInfo.icon}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-inherit"
                        />
                        {modeInfo.label}
                      </span>
                    </div>
                    <div className="flex gap-[.5rem] sm:gap-[1rem] items-center">
                      <span className="text-[#454545] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[400]">
                        Time Limit:
                      </span>
                      <span className="text-[#2B2B2B] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[500]">
                        {timeLimitDisplay}
                      </span>
                    </div>

                    {category && (
                      <div className="flex gap-[.5rem] sm:gap-[1rem] items-center">
                        <span className="text-[#454545] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[400]">
                          Category:
                        </span>
                        <span className="text-[#2B2B2B] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[500] capitalize">
                          {category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart + Overview row */}
              <div className="flex flex-col lg:flex-row mt-4 sm:mt-6 gap-[1rem] sm:gap-[1.5rem]">
                {/* Pie Chart */}
                <div
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                  }}
                  className="p-4 sm:p-6 flex-1 flex flex-col bg-white rounded-[1rem]"
                >
                  <div className="flex pb-3 sm:pb-4 items-center gap-[.75rem] sm:gap-[1rem]">
                    <span
                      style={{ boxShadow: "0 3px 14px 0 rgba(0, 0, 0, 0.08)" }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-[50%] flex items-center justify-center shrink-0"
                    >
                      <Icon
                        icon="hugeicons:chart-evaluation"
                        className="w-5 h-5 sm:w-6 sm:h-6 text-[#2B2B2B]"
                      />
                    </span>
                    <span className="text-[#2B2B2B] leading-6 sm:leading-7 text-[.9375rem] sm:text-[1.125rem] font-[500]">
                      Question Performance
                    </span>
                  </div>
                  <div className="flex-1 min-h-[220px] sm:min-h-[280px]">
                    {pieData.length > 0 ? (
                      <Chart
                        type="pie"
                        data={pieData}
                        pieChartProps={{ isHollow: true }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Icon
                          icon="hugeicons:chart-evaluation"
                          className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mb-3"
                        />
                        <p className="text-[#757575] text-xs sm:text-sm">
                          No performance data
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exam Overview */}
                <div
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                  }}
                  className="p-4 sm:p-6 flex-1 flex flex-col bg-white rounded-[1rem]"
                >
                  <div className="flex pb-3 sm:pb-4 items-center gap-[.75rem] sm:gap-[1rem]">
                    <span
                      style={{ boxShadow: "0 3px 14px 0 rgba(0, 0, 0, 0.08)" }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-[50%] flex items-center justify-center shrink-0"
                    >
                      <Icon
                        icon="hugeicons:brain"
                        className="w-5 h-5 sm:w-6 sm:h-6 text-[#2B2B2B]"
                      />
                    </span>
                    <span className="text-[#2B2B2B] leading-6 sm:leading-7 text-[.9375rem] sm:text-[1.125rem] font-[500]">
                      Exam Overview
                    </span>
                  </div>

                  <div className="flex flex-1 justify-between flex-col gap-[.75rem] sm:gap-[1rem]">
                    {[
                      { name: "Total Questions", value: totalQuestions },
                      {
                        name: "Answered",
                        value: correctAnswers + wrongAnswers + essayQuestions,
                      },
                      { name: "Unanswered", value: unanswered },
                      ...(!hideScore
                        ? [
                            {
                              name: "Correct Answers",
                              value: correctAnswers,
                              color: COLOR_CORRECT,
                            },
                            {
                              name: "Incorrect Answers",
                              value: wrongAnswers,
                              color: COLOR_INCORRECT,
                            },
                          ]
                        : []),
                      ...(essayQuestions > 0
                        ? [
                            {
                              name: "Essay (peer review)",
                              value: essayQuestions,
                              color: COLOR_ESSAY,
                            },
                          ]
                        : []),
                    ].map((item, index) => (
                      <div
                        key={`__stat__${index}`}
                        className="flex gap-[.5rem] sm:gap-[1rem] items-center"
                      >
                        <span className="text-[#454545] leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[400]">
                          {item.name}:
                        </span>
                        <span
                          style={item.color ? { color: item.color } : undefined}
                          className={cn(
                            "leading-6 sm:leading-7 text-[.875rem] sm:text-[1.125rem] font-[500]",
                            !item.color && "text-[#2B2B2B]",
                          )}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>,

            /* ── TAB 2: Exam Questions & Answers ─────────────────────────── */
            <section key="qa" className="pt-6">
              {totalCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Icon
                    icon="hugeicons:file-not-found"
                    className="w-16 h-16 text-gray-300 mb-4"
                  />
                  <p className="text-[#757575] text-sm">
                    No question details available for this attempt.
                  </p>
                </div>
              ) : (
                <>
                  {/* Question number navigator — uses lightweight questionStatuses */}
                  <div
                    style={{
                      boxShadow:
                        "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                    }}
                    className="bg-white rounded-[1rem] p-3 sm:p-4 mb-4 sm:mb-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <span className="text-xs sm:text-sm font-medium text-[#454545] shrink-0">
                        Jump to question:
                      </span>
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap text-[.6875rem] sm:text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-100 inline-block" />
                          Correct
                        </span>
                        <span className="flex items-center gap-1 ml-1.5 sm:ml-2">
                          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-red-100 inline-block" />
                          Incorrect
                        </span>
                        <span className="flex items-center gap-1 ml-1.5 sm:ml-2">
                          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-amber-50 inline-block" />
                          Unanswered
                        </span>
                        <span className="flex items-center gap-1 ml-1.5 sm:ml-2">
                          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-100 inline-block" />
                          Essay
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {Array.from({ length: totalCount }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => navigateTo(i + 1)}
                          className={getQuestionPillStyle(
                            questionStatuses[i],
                            i,
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current question card or page skeleton */}
                  {isPageLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="bg-gray-100 rounded-[1rem] h-80" />
                    </div>
                  ) : question ? (
                    <QuestionCard
                      question={question}
                      questionNumber={currentQuestion}
                      onShowFullDetails={() => handleShowFullDetails(question)}
                    />
                  ) : null}

                  {/* Prev / Next navigation */}
                  <div className="flex items-center justify-between mt-4 sm:mt-6">
                    <Button
                      onClick={() =>
                        navigateTo(Math.max(1, currentQuestion - 1))
                      }
                      disabled={currentQuestion === 1}
                    >
                      <Icon
                        icon="hugeicons:arrow-left-01"
                        className="w-4 h-4"
                      />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <span className="text-[.6875rem] sm:text-sm font-medium text-[#454545]">
                      Question {currentQuestion} of {totalCount}
                    </span>
                    <Button
                      onClick={() =>
                        navigateTo(Math.min(totalCount, currentQuestion + 1))
                      }
                      disabled={currentQuestion === totalCount}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <Icon
                        icon="hugeicons:arrow-right-01"
                        className="w-4 h-4"
                      />
                    </Button>
                  </div>
                </>
              )}
            </section>,
          ]}
        />
      </section>

      {/* Explanation Modal */}
      {showFullDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-6 sm:my-8">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                Explanation
              </h2>
              <button
                onClick={() => setShowFullDetails(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <Icon icon="hugeicons:cancel-01" className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-5">
              {fullDetailsTopic && (
                <div className="mb-3 sm:mb-4">
                  <p className="text-[.625rem] sm:text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
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
                        className="text-blue-500 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1"
                      >
                        View Topic
                        <Icon
                          icon="hugeicons:arrow-right-01"
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              )}
              <div className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                {fullDetailsContent ? (
                  <ContentRenderer content={fullDetailsContent} />
                ) : (
                  <p className="text-gray-400 italic">
                    No detailed explanation available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Question Card sub-component ───────────────────────────────────────────────
interface QuestionCardProps {
  question: IDetailedResult;
  questionNumber: number;
  onShowFullDetails: () => void;
}

function QuestionCard({
  question,
  questionNumber,
  onShowFullDetails,
}: QuestionCardProps) {
  const { isEssay, isTextInput, isMultipleResponse, isMatching } =
    getQuestionType(question.questionType);
  const isMultipleChoice =
    !isEssay && !isTextInput && !isMultipleResponse && !isMatching;

  const { studentAnswer, correctAnswer, isCorrect } = question;

  const correctSet = Array.isArray(correctAnswer)
    ? (correctAnswer as string[])
    : correctAnswer != null
      ? [correctAnswer as string]
      : [];

  const hasStudentAnswer =
    studentAnswer !== null &&
    studentAnswer !== undefined &&
    (typeof studentAnswer === "string"
      ? studentAnswer.trim() !== ""
      : Array.isArray(studentAnswer)
        ? studentAnswer.length > 0
        : Object.keys(studentAnswer as object).length > 0);

  return (
    <div
      style={{
        boxShadow:
          "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
      }}
      className="bg-white rounded-[1rem] p-[1rem_1rem_1.5rem_1rem] sm:p-[1.25rem_1.375rem_2rem_1.375rem]"
    >
      {/* Question header */}
      <div className="flex items-center justify-between pb-3 sm:pb-5 border-b border-[#EDEDED]">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          Question {questionNumber}
        </h3>
        <div className="flex items-center gap-2">
          {isEssay ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
              <Icon icon="hugeicons:pencil-edit-01" className="w-3.5 h-3.5" />
              Essay
            </span>
          ) : isCorrect === true ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
              <Icon icon="hugeicons:tick-01" className="w-3.5 h-3.5" />
              Correct
            </span>
          ) : isCorrect === false && hasStudentAnswer ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <Icon icon="hugeicons:cancel-circle" className="w-3.5 h-3.5" />
              Incorrect
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
              <Icon icon="hugeicons:alert-02" className="w-3.5 h-3.5" />
              Unanswered
            </span>
          )}
        </div>
      </div>

      <div className="pt-3 sm:pt-5">
        {/* Passage */}
        {question.passage && (
          <div className="mb-4 sm:mb-5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
            <p className="text-[.625rem] sm:text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
              Read the passage below
            </p>
            {question.passage.title && (
              <h4 className="font-semibold text-gray-800 mb-2 text-xs sm:text-sm">
                {question.passage.title}
              </h4>
            )}
            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed max-h-48 sm:max-h-56 overflow-y-auto pr-1">
              <ContentRenderer content={question.passage.content} contentFormat={question.passage.contentFormat} />
            </div>
          </div>
        )}

        {/* Question text */}
        <div className="text-gray-700 mb-4 sm:mb-6 text-[.8125rem] sm:text-[.9375rem] leading-relaxed">
          <ContentRenderer content={question.questionText} contentFormat={question.contentFormat} />
        </div>

        {/* ── Essay ── */}
        {isEssay && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Your Answer
              </p>
              <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed min-h-[80px]">
                {hasStudentAnswer ? (
                  <ContentRenderer content={studentAnswer as string} />
                ) : (
                  <p className="text-gray-400 italic">No answer provided.</p>
                )}
              </div>
            </div>
            {correctAnswer && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Model Answer
                </p>
                <div className="border border-[#EDEDED] bg-[#F8F9FA] rounded-xl p-4 text-sm text-gray-700 leading-relaxed min-h-[80px]">
                  <ContentRenderer content={correctAnswer as string} />
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400 italic">
              Essay answers are not auto-graded. Compare your response with the
              model answer above.
            </p>
          </div>
        )}

        {/* ── Fill in blank / Short answer ── */}
        {isTextInput && (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Your Answer
              </p>
              <div
                className={cn(
                  "border rounded-lg px-4 py-3 text-sm font-medium",
                  isCorrect === true
                    ? "border-green-400 bg-green-50 text-green-700"
                    : isCorrect === false
                      ? "border-red-400 bg-red-50 text-red-600"
                      : "border-gray-200 bg-gray-50 text-gray-500 italic",
                )}
              >
                {hasStudentAnswer ? (studentAnswer as string) : "Not answered"}
              </div>
            </div>
            {isCorrect !== true && correctAnswer && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Correct Answer
                </p>
                <div className="border border-green-400 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
                  {String(correctAnswer)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Matching ── */}
        {isMatching && (
          <MatchingQuestion
            prompts={question.matchingPrompts ?? []}
            options={question.matchingOptions ?? []}
            value={(studentAnswer as Record<string, string>) ?? {}}
            onChange={() => {}}
            revealed
            correctAnswer={
              (correctAnswer as Record<string, string>) ?? undefined
            }
            disabled
          />
        )}

        {/* ── Multiple response (select all that apply) ── */}
        {isMultipleResponse && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 mb-2">Select all that apply.</p>
            {question.options.map((option, optionIndex) => {
              const state = getOptionState(option.id, question);
              const rowStyle = {
                "correct-picked": "bg-green-50 border-green-300",
                "correct-missed": "bg-white border-green-200",
                "wrong-picked": "bg-red-50 border-red-200",
                default: "bg-white border-[#EDEDED]",
              }[state];
              const textStyle = {
                "correct-picked": "text-green-700",
                "correct-missed": "text-green-600",
                "wrong-picked": "text-red-600",
                default: "text-gray-600",
              }[state];
              const letterStyle = {
                "correct-picked": "text-green-600",
                "correct-missed": "text-green-600",
                "wrong-picked": "text-red-500",
                default: "text-gray-400",
              }[state];
              const checkState =
                state === "correct-picked" || state === "correct-missed"
                  ? "correct"
                  : state === "wrong-picked"
                    ? "incorrect"
                    : undefined;
              const letter = String.fromCharCode(65 + optionIndex);

              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg p-3 border",
                    rowStyle,
                  )}
                >
                  <CheckBox
                    state={checkState}
                    value={
                      state === "correct-picked" || state === "wrong-picked"
                    }
                    onChange={undefined}
                  />
                  <span
                    className={cn(
                      "text-xs font-bold w-5 shrink-0",
                      letterStyle,
                    )}
                  >
                    {letter}
                  </span>
                  <span className={cn("text-sm flex-1", textStyle)}>
                    <ContentRenderer content={option.text} variant="inline" />
                  </span>
                  {state === "correct-picked" && (
                    <span className="text-xs font-medium text-green-700 flex-shrink-0">
                      Your pick ✓
                    </span>
                  )}
                  {state === "correct-missed" && (
                    <span className="text-xs font-medium text-green-600 flex-shrink-0">
                      Missed
                    </span>
                  )}
                  {state === "wrong-picked" && (
                    <span className="text-xs font-medium text-red-600 flex-shrink-0">
                      Your pick ✗
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Multiple choice / True-False ── */}
        {isMultipleChoice && (
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => {
              const state = getOptionState(option.id, question);
              const radioState =
                state === "correct-picked" || state === "correct-missed"
                  ? "correct"
                  : state === "wrong-picked"
                    ? "incorrect"
                    : undefined;
              const rowStyle =
                state === "correct-picked" || state === "correct-missed"
                  ? "bg-green-50 border-green-200"
                  : state === "wrong-picked"
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-[#EDEDED]";
              const textStyle =
                state === "correct-picked" || state === "correct-missed"
                  ? "text-green-700"
                  : state === "wrong-picked"
                    ? "text-red-600"
                    : "text-gray-600";
              const letterStyle =
                state === "correct-picked" || state === "correct-missed"
                  ? "text-green-600"
                  : state === "wrong-picked"
                    ? "text-red-500"
                    : "text-gray-400";
              const letter = String.fromCharCode(65 + optionIndex);

              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 w-full text-left p-3 rounded-lg border transition-colors",
                    rowStyle,
                  )}
                >
                  <Radio
                    name={`q-review-${question.questionId}`}
                    state={radioState}
                    value={
                      state === "correct-picked" || state === "wrong-picked"
                    }
                    onChange={undefined}
                  />
                  <span
                    className={cn(
                      "text-xs font-bold w-5 shrink-0",
                      letterStyle,
                    )}
                  >
                    {letter}
                  </span>
                  <span className={cn("text-sm flex-1", textStyle)}>
                    <ContentRenderer content={option.text} variant="inline" />
                  </span>
                  {state === "correct-picked" && (
                    <span className="text-xs font-medium text-green-700 flex-shrink-0">
                      Correct ✓ Your answer
                    </span>
                  )}
                  {state === "correct-missed" && (
                    <span className="text-xs font-medium text-green-700 flex-shrink-0">
                      Correct answer
                    </span>
                  )}
                  {state === "wrong-picked" && (
                    <span className="text-xs font-medium text-red-500 flex-shrink-0">
                      Your answer ✗
                    </span>
                  )}
                </div>
              );
            })}

            {!hasStudentAnswer && correctSet.length > 0 && (
              <p className="text-sm text-gray-500 italic mt-2">
                This question was not answered.
              </p>
            )}
          </div>
        )}

        {/* ── Explanation card (same blue box as revision mode) ── */}
        {!isEssay && (question.topicId || question.topicName || question.explanation) && (
          <div
            style={{
              borderColor: "#258BE4",
            }}
            className="rounded-xl border mt-4 sm:mt-6 p-3 sm:p-5 bg-[#DBEDFF] overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Explanation</h3>
              {question.explanation && (
                <button
                  onClick={onShowFullDetails}
                  className="text-[#E32E89] text-xs sm:text-sm font-medium hover:underline flex items-center gap-1 mt-1.5 sm:mt-0"
                >
                  Full Description Here
                  <Icon icon="hugeicons:arrow-right-01" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {question.topicName && (
              <>
                <div className="h-[1px] w-full bg-[#EDEDED] my-3 sm:my-4" />
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">
                    {question.topicName}
                  </p>
                  {question.topicId && (
                    <Link
                      href={`/student/topics/${question.topicId}`}
                      target="_blank"
                      className="text-blue-500 hover:text-blue-700 text-[.625rem] sm:text-xs font-medium flex items-center gap-1"
                    >
                      View Topic
                      <Icon
                        icon="hugeicons:arrow-right-01"
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                      />
                    </Link>
                  )}
                </div>
              </>
            )}

            {question.explanation && (
              <>
                <div className="h-[1px] w-full bg-[#EDEDED] my-3 sm:my-4" />
                <div className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                  <ContentRenderer content={question.explanation} contentFormat={question.contentFormat} variant="inline" />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Review;
