"use client";

import { Chart } from "@/components/molecules";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import React, { useEffect, useRef, useState } from "react";
import { useStudentStore } from "@/store/student.store";
import { useAuthStore } from "@/store";
import { CARD_SHADOW } from "@/utils";

// ── Palette ───────────────────────────────────────────────────────────────────

const SUBJECT_COLORS = [
  "#007FFF",
  "#A12161",
  "#4BABFF",
  "#D4527A",
  "#0052CC",
  "#E91E8C",
  "#66C2FF",
  "#8B1A50",
];

const GRANULARITY_OPTIONS = [
  { label: "Daily", value: "day" as const, hint: "This week" },
  { label: "Weekly", value: "week" as const, hint: "This month" },
  { label: "Monthly", value: "month" as const, hint: "This year" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function monthAgoISO(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildDayLabel(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function shiftDay(iso: string, dir: -1 | 1): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + dir);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function fmtProgressLabel(period: string, granularity: string): string {
  const d = new Date(period + "T12:00:00Z");
  if (granularity === "month")
    return d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  if (granularity === "week") {
    const end = new Date(d);
    end.setUTCDate(d.getUTCDate() + 6);
    const month = d.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    return `${month} ${d.getUTCDate()}-${end.getUTCDate()}`;
  }
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ── Shared UI atoms ───────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex items-center justify-center w-full h-full">
    <Icon icon="svg-spinners:ring-resize" className="w-8 h-8 text-[#007FFF]" />
  </div>
);

const EmptyChart = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <Icon
      icon="hugeicons:chart-evaluation"
      className="w-12 h-12 text-gray-300 mb-3"
    />
    <p className="text-[#757575] text-sm">{label}</p>
  </div>
);

const DateRangePicker = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) => (
  <div className="flex w-fit items-center gap-2 bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg px-2.5 py-1.5">
    <Icon
      icon="hugeicons:calendar-03"
      className="w-3.5 h-3.5 text-[#A6A6A6] shrink-0"
    />
    <input
      type="date"
      value={startDate}
      max={endDate || todayISO()}
      onChange={(e) => onStartChange(e.target.value)}
      className="text-[.7rem] font-[500] text-[#2B2B2B] bg-transparent outline-none border-none cursor-pointer"
    />
    <span className="text-[#A6A6A6] text-[.7rem]">–</span>
    <input
      type="date"
      value={endDate}
      min={startDate}
      max={todayISO()}
      onChange={(e) => onEndChange(e.target.value)}
      className="text-[.7rem] font-[500] text-[#2B2B2B] bg-transparent outline-none border-none cursor-pointer"
    />
  </div>
);

const DayPicker = ({
  day,
  onShift,
}: {
  day: string;
  onShift: (dir: -1 | 1) => void;
}) => (
  <div className="flex items-center w-fit gap-1 bg-white border border-[#E5E5E5] rounded-lg px-1 py-1">
    <button
      onClick={() => onShift(-1)}
      className="p-1 rounded hover:bg-gray-50"
    >
      <Icon
        icon="hugeicons:arrow-left-01"
        className="w-3.5 h-3.5 text-gray-600"
      />
    </button>
    <span className="text-[.7rem] font-[500] text-gray-700 min-w-[120px] text-center">
      {buildDayLabel(day)}
    </span>
    <button onClick={() => onShift(1)} className="p-1 rounded hover:bg-gray-50">
      <Icon
        icon="hugeicons:arrow-right-01"
        className="w-3.5 h-3.5 text-gray-600"
      />
    </button>
  </div>
);

// ── Skeleton replicas (match exact card layout) ───────────────────────────────

const SkeletonSubjectScores = () => (
  <div
    style={{ boxShadow: CARD_SHADOW }}
    className="bg-white rounded-xl p-3 border border-[#D6D6D6]"
  >
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 px-[.5rem] gap-3">
        <div className="space-y-2">
          <div className="h-5 bg-gray-100 rounded w-52" />
          <div className="h-3 bg-gray-100 rounded w-44" />
        </div>
        <div className="h-9 bg-gray-100 rounded-lg w-full md:w-56" />
      </div>
      <div className="h-[320px] bg-gray-100 rounded" />
    </div>
  </div>
);

const SkeletonProgressOverTime = () => (
  <div
    style={{ boxShadow: CARD_SHADOW }}
    className="bg-white rounded-xl p-3 border border-[#D6D6D6]"
  >
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 px-[.5rem] gap-3">
        <div className="space-y-2">
          <div className="h-5 bg-gray-100 rounded w-44" />
          <div className="h-3 bg-gray-100 rounded w-36" />
        </div>
        <div className="h-9 bg-gray-100 rounded-lg w-full md:w-36" />
      </div>
      <div className="h-[320px] bg-gray-100 rounded" />
    </div>
  </div>
);

const SkeletonQuestionDist = () => (
  <div
    style={{ boxShadow: CARD_SHADOW }}
    className="bg-white rounded-xl p-3 border border-[#D6D6D6] flex flex-col"
  >
    <div className="animate-pulse">
      <div className="space-y-2 mb-4">
        <div className="h-5 bg-gray-100 rounded w-44" />
        <div className="h-3 bg-gray-100 rounded w-32" />
      </div>
      <div className="h-[280px] bg-gray-100 rounded" />
    </div>
  </div>
);

const SkeletonRanking = () => (
  <div
    style={{ boxShadow: CARD_SHADOW }}
    className="bg-white rounded-xl p-3 border border-[#D6D6D6]"
  >
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 px-[.5rem] gap-3">
        <div className="space-y-2">
          <div className="h-5 bg-gray-100 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-32" />
        </div>
        <div className="h-9 bg-gray-100 rounded-lg w-full md:w-56" />
      </div>
      <div className="h-[320px] bg-gray-100 rounded" />
    </div>
  </div>
);

const SkeletonSubjectAttempts = () => (
  <div
    style={{ boxShadow: CARD_SHADOW }}
    className="bg-white rounded-xl p-3 border border-[#D6D6D6] flex flex-col"
  >
    <div className="animate-pulse">
      <div className="space-y-2 mb-3">
        <div className="h-5 bg-gray-100 rounded w-40" />
        <div className="h-3 bg-gray-100 rounded w-32" />
      </div>
      <div className="h-8 bg-gray-100 rounded-lg mb-3 w-44" />
      <div className="h-[240px] bg-gray-100 rounded" />
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const Analytics = () => {
  const { accessToken } = useAuthStore();
  const {
    lastExamTypeId,
    dashboardData,
    analyticsSubjectScoresRange,
    analyticsProgressOverTime,
    analyticsQuestionDistribution,
    analyticsRanking,
    analyticsSubjectAttempts,
    isLoadingAnalytics,
    isLoadingProgressOverTime,
    isLoadingSubjectAttempts,
    isLoadingSubjectScoreAnalytics,
    isLoadingRankingAnalytics,
    fetchAnalytics,
    fetchAnalyticsProgressOverTime,
    fetchAnalyticsSubjectAttempts,
    fetchAnalyticsSubjectScoresRange,
    fetchAnalyticsRankingRange,
    fetchDashboard,
    granularity: storeGranularity,
  } = useStudentStore();

  const examTypeId =
    lastExamTypeId ?? dashboardData?.student?.lastExamTypeId ?? "";
  const stats = dashboardData?.stats;
  const streak = dashboardData?.streak;
  const accuracyDelta = dashboardData?.accuracyDelta;

  // Per-chart filter state
  const [progressGranularity, setProgressGranularity] = useState<
    "day" | "week" | "month"
  >("month");

  const [subjectStartDate, setSubjectStartDate] = useState<string>(monthAgoISO);
  const [subjectEndDate, setSubjectEndDate] = useState<string>(todayISO);

  const [rankingStartDate, setRankingStartDate] = useState<string>(monthAgoISO);
  const [rankingEndDate, setRankingEndDate] = useState<string>(todayISO);

  const [attemptDay, setAttemptDay] = useState<string>(todayISO);
  const [showAccuracyInfo, setShowAccuracyInfo] = useState(false);
  const [progressDropdownOpen, setProgressDropdownOpen] = useState(false);

  // Track whether initial load has completed (skeleton vs spinner)
  const subjectScoresLoaded = useRef(false);
  const progressLoaded = useRef(false);
  const distLoaded = useRef(false);
  const rankingLoaded = useRef(false);
  const attemptsLoaded = useRef(false);

  // Refresh dashboard on mount
  useEffect(() => {
    if (!accessToken) return;
    fetchDashboard(storeGranularity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Chart 3: Question distribution — load once
  useEffect(() => {
    if (!examTypeId) return;
    fetchAnalytics({ examTypeId }).then(() => {
      distLoaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeId]);

  // Chart 1: Subject scores by date range
  useEffect(() => {
    if (!examTypeId) return;
    fetchAnalyticsSubjectScoresRange({
      examTypeId,
      startDate: subjectStartDate,
      endDate: subjectEndDate,
    }).then(() => {
      subjectScoresLoaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeId, subjectStartDate, subjectEndDate]);

  // Chart 2: Progress over time — granularity-only, calendar-relative
  useEffect(() => {
    if (!examTypeId) return;
    fetchAnalyticsProgressOverTime({
      examTypeId,
      granularity: progressGranularity,
    }).then(() => {
      progressLoaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeId, progressGranularity]);

  // Chart 4: Ranking by date range
  useEffect(() => {
    if (!examTypeId) return;
    fetchAnalyticsRankingRange({
      examTypeId,
      startDate: rankingStartDate,
      endDate: rankingEndDate,
    }).then(() => {
      rankingLoaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeId, rankingStartDate, rankingEndDate]);

  // Chart 5: Daily subject attempts — day picker
  useEffect(() => {
    if (!examTypeId) return;
    fetchAnalyticsSubjectAttempts({
      examTypeId,
      granularity: "day",
      date: attemptDay,
    }).then(() => {
      attemptsLoaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeId, attemptDay]);

  // ── Chart data transforms ─────────────────────────────────────────────────

  const subjectScoreData = analyticsSubjectScoresRange ?? [];

  const progressData = (analyticsProgressOverTime?.data ?? []).map((p) => ({
    name: fmtProgressLabel(p.period, progressGranularity),
    Accuracy: p.accuracy,
  }));

  const dist = analyticsQuestionDistribution;
  const distTotal = (dist?.correct ?? 0) + (dist?.wrong ?? 0);
  const pieData = dist
    ? [
        { name: "Correct", value: dist.correct, fill: "#007FFF" },
        { name: "Wrong", value: dist.wrong, fill: "#A12161" },
      ].filter((d) => d.value > 0)
    : [];

  const rankingData = (analyticsRanking?.chartData ?? []).map((r) => ({
    name: r.isCurrentStudent ? `${r.label} (you)` : r.label,
    Score: r.score,
    fill: r.isCurrentStudent ? "#007FFF" : "#A12161",
  }));

  const subjectAttemptsData = analyticsSubjectAttempts.map((s, i) => ({
    name: s.subjectName,
    Questions: s.questionsAttempted,
    fill: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  // Delta badge
  const deltaValue = accuracyDelta?.delta ?? 0;
  const deltaUp = deltaValue >= 0;
  const showDelta = dashboardData != null;
  const deltaDisplay =
    accuracyDelta?.delta !== null && accuracyDelta?.delta !== undefined
      ? Math.abs(accuracyDelta.delta).toFixed(1)
      : "0";

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <section className="mb-5">
        <h1 className="text-xl md:text-2xl font-[600] text-[#171717]">
          Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Your live performance, progress and the overall performance of other
          candidates
        </p>
      </section>

      {/* ── Top Stats ──────────────────────────────────────────────────────── */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {/* Card 1: Overall Accuracy */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-3 px-3 md:py-5 md:px-4 border border-[#D6D6D6]"
        >
          <div className="w-full">
            <div className="bg-[#E5E8F8] rounded-lg flex p-[.625rem] md:p-[.875rem] w-fit items-center justify-center mb-3 md:mb-4">
              <Icon
                icon="hugeicons:target-01"
                height="1.5rem"
                width="1.5rem"
                className="text-[#007FFF]"
              />
            </div>
            <div className="flex mb-1 items-center gap-3">
              <p className="text-[#575757] text-sm">Overall Accuracy</p>
              <div className="relative flex items-center justify-center">
                <button
                  onClick={() => setShowAccuracyInfo((v) => !v)}
                  className="flex items-center"
                >
                  <Icon
                    icon="hugeicons:information-circle"
                    className="w-4 h-4 text-[#A6A6A6] cursor-pointer"
                  />
                </button>
                {showAccuracyInfo && (
                  <div className="absolute left-0 top-6 z-20 w-[220px] bg-white border border-[#E5E5E5] rounded-xl shadow-lg p-3 text-xs text-[#575757] leading-[1.5]">
                    <p className="font-[600] text-[#2B2B2B] mb-1">
                      How is this calculated?
                    </p>
                    <p>
                      Total correct answers ÷ total questions attempted × 100,
                      weighted across all your exam sessions for this exam type.
                    </p>
                    <p className="mt-1 text-[#A6A6A6] text-[0.7rem]">
                      The badge shows the change vs last calendar month.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xl md:text-[1.75rem] mb-3 md:mb-4 leading-7 md:leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {stats ? `${Math.round(stats.overallAccuracy)}%` : "—"}
            </p>
            <div className="flex gap-[.25rem] items-center">
              {showDelta && (
                <>
                  <span
                    className={cn(
                      "p-[.125rem_.375rem] text-[.75rem] flex items-center gap-[.25rem] rounded-[.625rem] leading-5 font-[500]",
                      deltaUp
                        ? "bg-[#E7F6EC] text-[#036B26]"
                        : "bg-[#FBEAE9] text-[#D42620]",
                    )}
                  >
                    <Icon
                      icon={
                        deltaUp
                          ? "hugeicons:arrow-up-right-01"
                          : "hugeicons:arrow-down-left-01"
                      }
                      className="w-4 h-4"
                    />
                    {deltaDisplay}%
                  </span>
                  <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                    from last month
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Exams Completed */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-3 px-3 md:py-5 md:px-4 border border-[#D6D6D6]"
        >
          <div>
            <div className="bg-[#E6E6F1] rounded-lg flex p-[.625rem] md:p-[.875rem] w-fit items-center justify-center mb-3 md:mb-4">
              <Icon
                icon="hugeicons:medal-01"
                height="1.5rem"
                width="1.5rem"
                className="text-[#000077]"
              />
            </div>
            <p className="text-[#575757] text-sm mb-1">Exams Completed</p>
            <p className="text-xl md:text-[1.75rem] mb-3 md:mb-4 leading-7 md:leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {stats ? stats.totalExamsCompleted : "—"}
            </p>
            <div className="flex gap-[.25rem] items-center">
              {analyticsRanking ? (
                <span className="p-[.125rem_.375rem] text-[.75rem] flex items-center gap-[.25rem] rounded-[.625rem] leading-5 font-[500] bg-[#E7F6EC] text-[#036B26]">
                  <Icon icon="hugeicons:medal-03" className="w-4 h-4" />
                  Rank #
                  {analyticsRanking.examCountRank ??
                    analyticsRanking.rank} of {analyticsRanking.totalStudents}
                </span>
              ) : (
                <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                  &nbsp;
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Study Streak */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-3 px-3 md:py-5 md:px-4 border border-[#D6D6D6]"
        >
          <div>
            <div className="bg-[#F3F3F3] rounded-lg flex p-[.625rem] md:p-[.875rem] w-fit items-center justify-center mb-3 md:mb-4">
              <Icon
                icon="hugeicons:book-open-02"
                height="1.5rem"
                width="1.5rem"
                className="text-[#E32E89]"
              />
            </div>
            <p className="text-[#575757] text-sm mb-1">Study Streak</p>
            <p className="text-xl md:text-[1.75rem] mb-3 md:mb-4 leading-7 md:leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {streak ? `${streak.currentStreak} days` : "—"}
            </p>
            <div className="flex gap-[.25rem] items-center">
              <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                {streak
                  ? `Personal best: ${streak.longestStreak} day(s)`
                  : "No streak yet"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Chart 1: Score Against Each Subject (area, date range) ──────────── */}
      <section className="mt-5">
        {!subjectScoresLoaded.current && isLoadingSubjectScoreAnalytics ? (
          <SkeletonSubjectScores />
        ) : (
          <div
            style={{ boxShadow: CARD_SHADOW }}
            className="bg-white rounded-xl p-3 border border-[#D6D6D6]"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 gap-4">
              <div className="shrink-0">
                <h3 className="font-[500] text-base md:text-[1.125rem] text-gray-900">
                  Score Against Each Subject (%)
                </h3>
                <p className="text-[#757575] text-[.875rem] font-[400] leading-5">
                  Accuracy per subject within the selected date range
                </p>
              </div>
              <DateRangePicker
                startDate={subjectStartDate}
                endDate={subjectEndDate}
                onStartChange={setSubjectStartDate}
                onEndChange={setSubjectEndDate}
              />
            </div>
            <div className="h-[320px]">
              {isLoadingSubjectScoreAnalytics ? (
                <Spinner />
              ) : subjectScoreData.length === 0 ? (
                <EmptyChart label="No subject score data for this date range" />
              ) : (
                <Chart
                  type="area"
                  data={subjectScoreData}
                  labelProps={[
                    {
                      title: "Score",
                      color: "#007FFF",
                      barSize: 28,
                      radius: [4, 4, 0, 0],
                    },
                  ]}
                  prefersToolTip
                  yAxis={{ domain: [0, 100] }}
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Progress Over Time + Question Distribution ──────────────────────── */}
      <section className="grid mt-5 grid-cols-1 items-stretch lg:grid-cols-3 gap-6">
        {/* Chart 2: Progress Over Time (granularity only) */}
        {!progressLoaded.current && isLoadingProgressOverTime ? (
          <div className="lg:col-span-2">
            <SkeletonProgressOverTime />
          </div>
        ) : (
          <div
            style={{ boxShadow: CARD_SHADOW }}
            className="bg-white lg:col-span-2 rounded-xl p-3 border border-[#D6D6D6]"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 gap-3">
              <div className="shrink-0">
                <h3 className="font-[500] text-base md:text-[1.125rem] text-gray-900">
                  Progress Over Time
                </h3>
                <p className="text-[#757575] text-[.875rem] font-[400] leading-5">
                  Your accuracy trend —{" "}
                  {progressGranularity === "day"
                    ? "days this week"
                    : progressGranularity === "week"
                      ? "weeks this month"
                      : "months this year"}
                </p>
              </div>
              <div className="relative shrink-0 self-start">
                <button
                  onClick={() => setProgressDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  {
                    GRANULARITY_OPTIONS.find(
                      (o) => o.value === progressGranularity,
                    )?.label
                  }
                  <Icon icon="hugeicons:arrow-down-01" className="w-4 h-4" />
                </button>
                {progressDropdownOpen && (
                  <div className="absolute left-0 md:left-auto md:right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                    {GRANULARITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setProgressGranularity(option.value);
                          setProgressDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          progressGranularity === option.value
                            ? "bg-[#F3F3F3] text-[#A12161] font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="block">{option.label}</span>
                        <span className="block text-xs text-gray-400">
                          {option.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="h-[320px]">
              {isLoadingProgressOverTime ? (
                <Spinner />
              ) : progressData.length === 0 ? (
                <EmptyChart label="No progress data for this period" />
              ) : (
                <Chart
                  type="line"
                  data={progressData}
                  labelProps={[{ title: "Accuracy", color: "#E32E89" }]}
                  prefersToolTip
                  yAxis={{ domain: [0, 100] }}
                  lineChartProps={{ line: { strokeWidth: 4 } as any }}
                />
              )}
            </div>
          </div>
        )}

        {/* Chart 3: Question Distribution */}
        {!distLoaded.current && isLoadingAnalytics ? (
          <SkeletonQuestionDist />
        ) : (
          <div
            style={{ boxShadow: CARD_SHADOW }}
            className="bg-white rounded-xl p-3 border border-[#D6D6D6] flex flex-col"
          >
            <div className="mb-4">
              <h3 className="font-[500] text-base md:text-[1.125rem] text-gray-900">
                Question Distribution
              </h3>
              <p className="text-[#757575] text-[.875rem] font-[400] leading-5">
                Total questions: {distTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex-1 min-h-[280px]">
              {isLoadingAnalytics ? (
                <Spinner />
              ) : pieData.length === 0 ? (
                <EmptyChart label="No questions answered yet" />
              ) : (
                <Chart
                  type="pie"
                  data={pieData}
                  pieChartProps={{ isHollow: true }}
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Ranking + Subject Attempts ──────────────────────────────────────── */}
      <section className="grid mt-5 grid-cols-1 items-stretch lg:grid-cols-3 gap-6">
        {/* Chart 4: Student Ranking (date range) */}
        {!rankingLoaded.current && isLoadingRankingAnalytics ? (
          <div className="lg:col-span-2">
            <SkeletonRanking />
          </div>
        ) : (
          <div
            style={{ boxShadow: CARD_SHADOW }}
            className="bg-white lg:col-span-2 rounded-xl p-3 border border-[#D6D6D6]"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 gap-3">
              <div className="shrink-0">
                <h3 className="font-[500] text-base md:text-[1.125rem] text-gray-900">
                  Student Ranking
                </h3>
                <p className="text-[#757575] text-[.875rem] font-[400] leading-5">
                  Your average score vs other candidates
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {analyticsRanking && (
                  <div className="text-right">
                    <p className="text-xs text-[#757575]">Your percentile</p>
                    <p className="text-lg font-[600] text-[#007FFF]">
                      {rankingData.length > 0
                        ? `Top ${Math.max(1, 100 - analyticsRanking.percentile)}%`
                        : "NIL"}
                    </p>
                  </div>
                )}
                <DateRangePicker
                  startDate={rankingStartDate}
                  endDate={rankingEndDate}
                  onStartChange={setRankingStartDate}
                  onEndChange={setRankingEndDate}
                />
              </div>
            </div>
            <div className="h-[320px]">
              {isLoadingRankingAnalytics ? (
                <Spinner />
              ) : rankingData.length === 0 ? (
                <EmptyChart label="No ranking data for this range" />
              ) : (
                <Chart
                  type="bar"
                  data={rankingData}
                  labelProps={[
                    {
                      title: "Score",
                      color: "#A12161",
                      barSize: 20,
                      radius: [4, 4, 0, 0],
                      useDataFill: true,
                    },
                  ]}
                  prefersToolTip
                  yAxis={{ domain: [0, 100] }}
                />
              )}
            </div>
          </div>
        )}

        {/* Chart 5: Daily Test Attempt (day picker) */}
        {!attemptsLoaded.current && isLoadingSubjectAttempts ? (
          <SkeletonSubjectAttempts />
        ) : (
          <div
            style={{ boxShadow: CARD_SHADOW }}
            className="bg-white rounded-xl p-3 border border-[#D6D6D6] flex flex-col"
          >
            <div className="mb-3">
              <h3 className="font-[500] text-base md:text-[1.125rem] text-gray-900">
                Daily Test Attempt
              </h3>
              <p className="text-[#757575] text-[.875rem] font-[400] leading-5">
                Questions attempted per subject
              </p>
            </div>
            <div className="mb-3">
              <DayPicker
                day={attemptDay}
                onShift={(dir) => setAttemptDay(shiftDay(attemptDay, dir))}
              />
            </div>
            <div className="flex-1 min-h-[240px]">
              {isLoadingSubjectAttempts ? (
                <Spinner />
              ) : subjectAttemptsData.length === 0 ? (
                <EmptyChart label="No data for this day" />
              ) : (
                <Chart
                  type="bar"
                  data={subjectAttemptsData}
                  labelProps={[
                    {
                      title: "Questions",
                      color: "#007FFF",
                      barSize: 30,
                      radius: [4, 4, 0, 0],
                      useDataFill: true,
                    },
                  ]}
                  prefersToolTip
                />
              )}
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default Analytics;
