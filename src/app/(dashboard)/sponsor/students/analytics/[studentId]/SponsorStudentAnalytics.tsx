"use client";

import { Chart } from "@/components/molecules";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import React, { useEffect, useRef, useState } from "react";
import { useSponsorStore, useAuthStore } from "@/store";
import { CARD_SHADOW } from "@/utils";
import Link from "next/link";

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
  <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg px-2.5 py-1.5">
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

// ── Skeletons ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div
    style={{ boxShadow: CARD_SHADOW }}
    className="bg-white rounded-xl py-5 px-4 border border-[#D6D6D6] animate-pulse"
  >
    <div className="w-14 h-14 bg-gray-200 rounded-lg mb-4" />
    <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
    <div className="h-8 w-20 bg-gray-200 rounded mb-4" />
    <div className="h-3 w-28 bg-gray-200 rounded" />
  </div>
);

const SkeletonChart = ({ tall = false }: { tall?: boolean }) => (
  <div
    style={{ boxShadow: CARD_SHADOW }}
    className="bg-white rounded-xl p-4 border border-[#D6D6D6] animate-pulse"
  >
    <div className="flex items-start justify-between mb-6 px-[.5rem]">
      <div className="space-y-2">
        <div className="h-5 bg-gray-100 rounded w-48" />
        <div className="h-3 bg-gray-100 rounded w-36" />
      </div>
      <div className="h-9 bg-gray-100 rounded-lg w-40" />
    </div>
    <div
      className={`${tall ? "h-[320px]" : "h-[240px]"} bg-gray-100 rounded`}
    />
  </div>
);

// ── Sponsor analytics store hook (per-student) ────────────────────────────────

import { authRequest } from "@/lib/api";
import { handleAxiosError } from "@/utils";

interface StudentAnalytics {
  stats: {
    overallAccuracy: number;
    totalExamsCompleted: number;
  } | null;
  streak: { currentStreak: number; longestStreak: number } | null;
  accuracyDelta: { delta: number | null } | null;
  analyticsSubjectScoresRange: { name: string; Score: number }[];
  analyticsProgressOverTime: {
    data: { period: string; accuracy: number }[];
  } | null;
  analyticsQuestionDistribution: { correct: number; wrong: number } | null;
  analyticsRanking: {
    rank: number;
    examCountRank: number | null;
    percentile: number;
    totalStudents: number;
    chartData: { label: string; score: number; isCurrentStudent: boolean }[];
  } | null;
  analyticsSubjectAttempts: {
    subjectName: string;
    questionsAttempted: number;
  }[];
}

function useStudentAnalytics(studentId: string) {
  const [data, setData] = useState<StudentAnalytics>({
    stats: null,
    streak: null,
    accuracyDelta: null,
    analyticsSubjectScoresRange: [],
    analyticsProgressOverTime: null,
    analyticsQuestionDistribution: null,
    analyticsRanking: null,
    analyticsSubjectAttempts: [],
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingSubjectScores, setIsLoadingSubjectScores] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isLoadingDist, setIsLoadingDist] = useState(false);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);

  const fetchStats = async (eTypeId: string) => {
    setIsLoadingStats(true);
    try {
      const tz = encodeURIComponent(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      const res = (await authRequest({
        method: "GET",
        url: `/sponsors/students/${studentId}/dashboard?examTypeId=${eTypeId}&granularity=month&timezone=${tz}`,
      })) as any;
      const d = res.data?.data;
      if (d) {
        setData((prev) => ({
          ...prev,
          stats: d.stats ?? null,
          streak: d.streak ?? null,
          accuracyDelta: d.accuracyDelta ?? null,
        }));
      }
    } catch (error) {
      handleAxiosError(error, "Failed to load student stats");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchSubjectScores = async (
    eTypeId: string,
    startDate: string,
    endDate: string,
  ) => {
    setIsLoadingSubjectScores(true);
    try {
      const res = (await authRequest({
        method: "GET",
        url: `/sponsors/students/${studentId}/analytics/subject-scores?examTypeId=${eTypeId}&startDate=${startDate}&endDate=${endDate}`,
      })) as any;
      const d = res.data?.data;
      setData((prev) => ({
        ...prev,
        analyticsSubjectScoresRange: d ?? [],
      }));
    } catch {
      setData((prev) => ({ ...prev, analyticsSubjectScoresRange: [] }));
    } finally {
      setIsLoadingSubjectScores(false);
    }
  };

  const fetchProgress = async (
    eTypeId: string,
    granularity: "day" | "week" | "month",
  ) => {
    setIsLoadingProgress(true);
    try {
      const tz = encodeURIComponent(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      const res = (await authRequest({
        method: "GET",
        url: `/sponsors/students/${studentId}/analytics/progress?examTypeId=${eTypeId}&granularity=${granularity}&timezone=${tz}`,
      })) as any;
      const d = res.data?.data;
      setData((prev) => ({
        ...prev,
        analyticsProgressOverTime: d ?? null,
      }));
    } catch {
      setData((prev) => ({ ...prev, analyticsProgressOverTime: null }));
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const fetchDist = async (eTypeId: string) => {
    setIsLoadingDist(true);
    try {
      const res = (await authRequest({
        method: "GET",
        url: `/sponsors/students/${studentId}/analytics/question-distribution?examTypeId=${eTypeId}`,
      })) as any;
      const d = res.data?.data;
      setData((prev) => ({
        ...prev,
        analyticsQuestionDistribution: d ?? null,
      }));
    } catch {
      setData((prev) => ({ ...prev, analyticsQuestionDistribution: null }));
    } finally {
      setIsLoadingDist(false);
    }
  };

  const fetchRanking = async (
    eTypeId: string,
    startDate: string,
    endDate: string,
  ) => {
    setIsLoadingRanking(true);
    try {
      const res = (await authRequest({
        method: "GET",
        url: `/sponsors/students/${studentId}/analytics/ranking?examTypeId=${eTypeId}&startDate=${startDate}&endDate=${endDate}`,
      })) as any;
      const d = res.data?.data;
      setData((prev) => ({
        ...prev,
        analyticsRanking: d ?? null,
      }));
    } catch {
      setData((prev) => ({ ...prev, analyticsRanking: null }));
    } finally {
      setIsLoadingRanking(false);
    }
  };

  const fetchAttempts = async (eTypeId: string, date: string) => {
    setIsLoadingAttempts(true);
    try {
      const res = (await authRequest({
        method: "GET",
        url: `/sponsors/students/${studentId}/analytics/subject-attempts?examTypeId=${eTypeId}&granularity=day&date=${date}`,
      })) as any;
      const d = res.data?.data;
      setData((prev) => ({
        ...prev,
        analyticsSubjectAttempts: d ?? [],
      }));
    } catch {
      setData((prev) => ({ ...prev, analyticsSubjectAttempts: [] }));
    } finally {
      setIsLoadingAttempts(false);
    }
  };

  return {
    data,
    isLoadingStats,
    isLoadingSubjectScores,
    isLoadingProgress,
    isLoadingDist,
    isLoadingRanking,
    isLoadingAttempts,
    fetchStats,
    fetchSubjectScores,
    fetchProgress,
    fetchDist,
    fetchRanking,
    fetchAttempts,
  };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SponsorStudentAnalytics({
  studentId,
}: {
  studentId: string;
}) {
  const { accessToken } = useAuthStore();
  const { students, fetchStudents } = useSponsorStore();

  // On direct load / refresh the store may be empty — hydrate it
  useEffect(() => {
    if (!accessToken) return;
    if (students.length === 0) {
      fetchStudents(1, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Find student from store
  const student = students.find((s) => s.id === studentId);
  const examTypeId = student?.defaultExamTypeId ?? null;

  const {
    data,
    isLoadingStats,
    isLoadingSubjectScores,
    isLoadingProgress,
    isLoadingDist,
    isLoadingRanking,
    isLoadingAttempts,
    fetchStats,
    fetchSubjectScores,
    fetchProgress,
    fetchDist,
    fetchRanking,
    fetchAttempts,
  } = useStudentAnalytics(studentId);

  const [progressGranularity, setProgressGranularity] = useState<
    "day" | "week" | "month"
  >("month");
  const [subjectStartDate, setSubjectStartDate] = useState(monthAgoISO());
  const [subjectEndDate, setSubjectEndDate] = useState(todayISO());
  const [rankingStartDate, setRankingStartDate] = useState(monthAgoISO());
  const [rankingEndDate, setRankingEndDate] = useState(todayISO());
  const [attemptDay, setAttemptDay] = useState(todayISO());
  const [progressDropdownOpen, setProgressDropdownOpen] = useState(false);
  const [showAccuracyInfo, setShowAccuracyInfo] = useState(false);

  const subjectScoresLoaded = useRef(false);
  const progressLoaded = useRef(false);
  const distLoaded = useRef(false);
  const rankingLoaded = useRef(false);
  const attemptsLoaded = useRef(false);

  useEffect(() => {
    if (!accessToken || !examTypeId) return;
    fetchStats(examTypeId);
    fetchDist(examTypeId).then(() => {
      distLoaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, examTypeId]);

  useEffect(() => {
    if (!examTypeId) return;
    fetchSubjectScores(examTypeId, subjectStartDate, subjectEndDate).then(
      () => {
        subjectScoresLoaded.current = true;
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeId, subjectStartDate, subjectEndDate]);

  useEffect(() => {
    if (!examTypeId) return;
    fetchProgress(examTypeId, progressGranularity).then(() => {
      progressLoaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeId, progressGranularity]);

  useEffect(() => {
    if (!examTypeId) return;
    fetchRanking(examTypeId, rankingStartDate, rankingEndDate).then(() => {
      rankingLoaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeId, rankingStartDate, rankingEndDate]);

  useEffect(() => {
    if (!examTypeId) return;
    fetchAttempts(examTypeId, attemptDay).then(() => {
      attemptsLoaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeId, attemptDay]);

  // ── Chart data transforms ─────────────────────────────────────────────────

  const progressData = (data.analyticsProgressOverTime?.data ?? []).map(
    (p) => ({
      name: fmtProgressLabel(p.period, progressGranularity),
      Accuracy: p.accuracy,
    }),
  );

  const dist = data.analyticsQuestionDistribution;
  const distTotal = (dist?.correct ?? 0) + (dist?.wrong ?? 0);
  const pieData = dist
    ? [
        { name: "Correct", value: dist.correct, fill: "#007FFF" },
        { name: "Wrong", value: dist.wrong, fill: "#A12161" },
      ].filter((d) => d.value > 0)
    : [];

  const rankingData = (data.analyticsRanking?.chartData ?? []).map((r) => ({
    name: r.isCurrentStudent
      ? `${r.label} (${student?.firstName ?? "Student"})`
      : r.label,
    Score: r.score,
    fill: r.isCurrentStudent ? "#007FFF" : "#A12161",
  }));

  const subjectAttemptsData = data.analyticsSubjectAttempts.map((s, i) => ({
    name: s.subjectName,
    Questions: s.questionsAttempted,
    fill: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  const { stats, streak, accuracyDelta } = data;
  const deltaValue = accuracyDelta?.delta ?? 0;
  const deltaUp = deltaValue >= 0;
  const deltaDisplay =
    accuracyDelta?.delta !== null && accuracyDelta?.delta !== undefined
      ? Math.abs(accuracyDelta.delta).toFixed(1)
      : "0";

  const studentName = student
    ? `${student.firstName} ${student.lastName}`
    : "Student";

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <section className="mb-5 flex items-center gap-3">
        <Link
          href="/sponsor/students"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Back to students"
        >
          <Icon
            icon="hugeicons:arrow-left-01"
            className="w-5 h-5 text-[#575757]"
          />
        </Link>
        <div>
          <h1 className="text-2xl font-[600] text-[#171717]">
            {studentName}&apos;s Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Live performance, progress and ranking for this student
          </p>
        </div>
      </section>

      {/* ── Top Stats ────────────────────────────────────────────────────────── */}
      <section className="grid gap-6 grid-cols-3">
        {isLoadingStats && !stats ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Card 1: Overall Accuracy */}
            <div
              style={{ boxShadow: CARD_SHADOW }}
              className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
            >
              <div className="w-full">
                <div className="bg-[#E5E8F8] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
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
                    <button onClick={() => setShowAccuracyInfo((v) => !v)}>
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
                          Total correct answers ÷ total questions attempted ×
                          100, weighted across all exam sessions for this
                          student.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
                  {stats ? `${Math.round(stats.overallAccuracy)}%` : "—"}
                </p>
                <div className="flex gap-[.25rem] items-center">
                  {stats && (
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
              className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
            >
              <div>
                <div className="bg-[#E6E6F1] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
                  <Icon
                    icon="hugeicons:medal-01"
                    height="1.5rem"
                    width="1.5rem"
                    className="text-[#000077]"
                  />
                </div>
                <p className="text-[#575757] text-sm mb-1">Exams Completed</p>
                <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
                  {stats ? stats.totalExamsCompleted : "—"}
                </p>
                <div className="flex gap-[.25rem] items-center">
                  {data.analyticsRanking ? (
                    <span className="p-[.125rem_.375rem] text-[.75rem] flex items-center gap-[.25rem] rounded-[.625rem] leading-5 font-[500] bg-[#E7F6EC] text-[#036B26]">
                      <Icon icon="hugeicons:medal-03" className="w-4 h-4" />
                      Rank #
                      {data.analyticsRanking.examCountRank ??
                        data.analyticsRanking.rank}{" "}
                      of {data.analyticsRanking.totalStudents}
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
              className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
            >
              <div>
                <div className="bg-[#F3F3F3] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
                  <Icon
                    icon="hugeicons:book-open-02"
                    height="1.5rem"
                    width="1.5rem"
                    className="text-[#E32E89]"
                  />
                </div>
                <p className="text-[#575757] text-sm mb-1">Study Streak</p>
                <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
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
          </>
        )}
      </section>

      {/* ── Chart 1: Score Against Each Subject ──────────────────────────────── */}
      <section className="mt-5">
        {!subjectScoresLoaded.current && isLoadingSubjectScores ? (
          <SkeletonChart tall />
        ) : (
          <div
            style={{ boxShadow: CARD_SHADOW }}
            className="bg-white rounded-xl p-4 border border-[#D6D6D6]"
          >
            <div className="flex items-start px-[.5rem] justify-between mb-6 gap-4">
              <div className="shrink-0">
                <h3 className="font-[500] text-[1.125rem] text-gray-900">
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
              {isLoadingSubjectScores ? (
                <Spinner />
              ) : data.analyticsSubjectScoresRange.length === 0 ? (
                <EmptyChart label="No subject score data for this date range" />
              ) : (
                <Chart
                  type="area"
                  data={data.analyticsSubjectScoresRange}
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

      {/* ── Progress + Distribution ───────────────────────────────────────────── */}
      <section className="grid mt-5 grid-cols-1 items-stretch lg:grid-cols-3 gap-6">
        {!progressLoaded.current && isLoadingProgress ? (
          <div className="lg:col-span-2">
            <SkeletonChart tall />
          </div>
        ) : (
          <div
            style={{ boxShadow: CARD_SHADOW }}
            className="bg-white lg:col-span-2 rounded-xl p-4 border border-[#D6D6D6]"
          >
            <div className="flex items-start px-[.5rem] justify-between mb-6 gap-3">
              <div className="shrink-0">
                <h3 className="font-[500] text-[1.125rem] text-gray-900">
                  Progress Over Time
                </h3>
                <p className="text-[#757575] text-[.875rem] font-[400] leading-5">
                  Accuracy trend —{" "}
                  {progressGranularity === "day"
                    ? "days this week"
                    : progressGranularity === "week"
                      ? "weeks this month"
                      : "months this year"}
                </p>
              </div>
              <div className="relative shrink-0">
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
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
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
              {isLoadingProgress ? (
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

        {!distLoaded.current && isLoadingDist ? (
          <SkeletonChart />
        ) : (
          <div
            style={{ boxShadow: CARD_SHADOW }}
            className="bg-white rounded-xl p-4 border border-[#D6D6D6] flex flex-col"
          >
            <div className="mb-4">
              <h3 className="font-[500] text-[1.125rem] text-gray-900">
                Question Distribution
              </h3>
              <p className="text-[#757575] text-[.875rem] font-[400] leading-5">
                Total questions: {distTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex-1 min-h-[280px]">
              {isLoadingDist ? (
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

      {/* ── Ranking + Subject Attempts ────────────────────────────────────────── */}
      <section className="grid mt-5 grid-cols-1 items-stretch lg:grid-cols-3 gap-6">
        {!rankingLoaded.current && isLoadingRanking ? (
          <div className="lg:col-span-2">
            <SkeletonChart tall />
          </div>
        ) : (
          <div
            style={{ boxShadow: CARD_SHADOW }}
            className="bg-white lg:col-span-2 rounded-xl p-4 border border-[#D6D6D6]"
          >
            <div className="flex items-start px-[.5rem] justify-between mb-2 gap-3">
              <div className="shrink-0">
                <h3 className="font-[500] text-[1.125rem] text-gray-900">
                  Student Ranking
                </h3>
                <p className="text-[#757575] text-[.875rem] font-[400] leading-5">
                  Average score vs other candidates
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {data.analyticsRanking && (
                  <div className="text-right">
                    <p className="text-xs text-[#757575]">Percentile</p>
                    <p className="text-lg font-[600] text-[#007FFF]">
                      {rankingData.length > 0
                        ? `Top ${Math.max(1, 100 - data.analyticsRanking.percentile)}%`
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
              {isLoadingRanking ? (
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

        {!attemptsLoaded.current && isLoadingAttempts ? (
          <SkeletonChart />
        ) : (
          <div
            style={{ boxShadow: CARD_SHADOW }}
            className="bg-white rounded-xl p-4 border border-[#D6D6D6] flex flex-col"
          >
            <div className="mb-3">
              <h3 className="font-[500] text-[1.125rem] text-gray-900">
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
              {isLoadingAttempts ? (
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
}
