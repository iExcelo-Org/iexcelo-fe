"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { SVGClient } from "@/components/atoms";
import { Chart } from "@/components/molecules";
import { useAuthStore, useStudentStore } from "@/store";
import {
  GRANULARITY_OPTIONS,
  SUBJECT_COLORS,
  formatPeriodLabel,
} from "@/utils";
import StudentSkeleton from "./StudentSkeleton";

export default function Student() {
  const { user, accessToken } = useAuthStore();
  const {
    dashboardData,
    isLoadingDashboard,
    isLoadingSubjectScores,
    granularity,
    setGranularity,
    fetchDashboard,
    fetchSubjectScores,
    switchExamType,
  } = useStudentStore();

  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Close granularity dropdown on outside click
  useEffect(() => {
    if (!periodOpen) return;
    const handler = (e: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [periodOpen]);

  useEffect(() => {
    if (!accessToken) return;
    fetchDashboard(granularity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!accessToken || !dashboardData) return;
    fetchSubjectScores(granularity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, granularity]);

  const stats = dashboardData?.stats;
  const currentExamType = dashboardData?.currentExamType;
  const subjectScores = dashboardData?.analytics?.subjectScores;
  const examsAvailable = dashboardData?.examsAvailable ?? [];
  const isSponsored = dashboardData?.student?.isSponsored ?? false;

  const chartLabelProps = (subjectScores?.subjects ?? []).map((subject, i) => ({
    title: subject.name,
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
    colorId: String(i),
  }));

  const activeOption =
    GRANULARITY_OPTIONS.find((o) => o.value === granularity) ??
    GRANULARITY_OPTIONS[1];

  const formattedChartData = (subjectScores?.data ?? []).map((item) => ({
    ...item,
    name: formatPeriodLabel(item.name as string, granularity),
  }));

  if (isLoadingDashboard) {
    return <StudentSkeleton />;
  }

  return (
    <section className="px-[.875rem] sm:px-[1.25rem] xl:px-[2rem] py-[1rem] sm:py-[1.25rem] mx-auto">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[1.125rem] sm:mb-6">
        <div>
          <h1 className="text-[1.125rem] sm:text-[1.5rem] xl:text-2xl font-bold text-gray-900 leading-tight">
            Welcome, {user?.firstName}
          </h1>
          <p className="text-gray-500 text-[.75rem] sm:text-sm mt-0.5 sm:mt-1">
            Track your journey, revisit past questions, and prepare with
            confidence
          </p>
        </div>
        {currentExamType?.name && (
          <div className="mt-2 md:mt-0 flex items-center gap-2">
            <span className="text-[.6875rem] sm:text-sm text-gray-500">
              Current Exam Type:
            </span>
            <span className="bg-[#F3F3F3] text-[#A12161] text-[.625rem] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-[.375rem] rounded-full">
              {currentExamType.name}
            </span>
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <div className="mb-[1.125rem] sm:mb-6">
        <div className="bg-[#007FFF] flex justify-between bg-[url(/images/students-dashboard-bg.png)] bg-center bg-cover rounded-2xl p-[1rem] sm:p-6 md:p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-[.9375rem] sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
              Ready to Test Your Knowledge?
            </h2>
            <p className="text-white/80 text-[.75rem] sm:text-sm md:text-base mb-3 sm:mb-4">
              Challenge yourself with real exam-style questions and see where
              you stand today.
            </p>
            <Link
              href="/student/exams"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-white text-[#0052CC] px-3 sm:px-4 py-[.375rem] sm:py-2 rounded-lg font-semibold text-[.75rem] sm:text-sm hover:bg-white/90 transition-colors"
            >
              Start Exam Now
              <Icon
                icon="hugeicons:arrow-right-01"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              />
            </Link>
          </div>
          <div className="opacity-80 hidden xl:block shrink-0">
            <SVGClient src="/svg/student-dashboard-svg.svg" />
          </div>
        </div>
      </div>

      {/* Stats — 1 column below sm, 3 columns sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-[1.125rem] sm:mb-5">
        {[
          {
            icon: "hugeicons:book-04",
            label: "Total Exams",
            value: stats?.totalExamsCompleted ?? 0,
            iconBg: "bg-[#E5E8F8]",
            iconColor: "text-[#007FFF]",
          },
          {
            icon: "hugeicons:book-02",
            label: "Total Subjects",
            value: stats?.totalSubjectsSelected ?? 0,
            iconBg: "bg-pink-50",
            iconColor: "text-pink-500",
          },
          {
            icon: "hugeicons:checkmark-square-02",
            label: "Questions Solved",
            value: stats?.totalQuestionsSolved ?? 0,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
          },
        ].map(({ icon, iconBg, iconColor, label, value }, index) => (
          <div
            key={`__item__${index}`}
            style={{
              boxShadow:
                "0 4px 4px 0 rgba(0, 0, 0, 0.00), 0 7px 12px 0 rgba(0, 0, 0, 0.02)",
            }}
            className="bg-white rounded-xl py-3.5 px-4 sm:py-5 sm:px-4 border border-[#D6D6D6] flex items-center gap-3 sm:flex-col sm:justify-center sm:items-start sm:gap-0 min-h-[7rem] sm:min-h-0"
          >
            <div
              className={`${iconBg} rounded-lg flex p-[.5rem] sm:p-[.875rem] w-fit shrink-0 items-center justify-center mb-0 sm:mb-4`}
            >
              <Icon
                icon={icon}
                height={"1.125rem"}
                width={"1.125rem"}
                className={`${iconColor} sm:!w-6 sm:!h-6`}
              />
            </div>
            <div>
              <p className="text-[#575757] text-[.75rem] sm:text-sm mb-0.5 sm:mb-1 leading-tight">
                {label}
              </p>
              <p className="text-[1.25rem] sm:text-[1.75rem] leading-tight sm:leading-[2.25rem] font-[500] text-[#2B2B2B]">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Exams grid */}
      <div className="grid grid-cols-1 items-stretch lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Score chart */}
        <div className="lg:col-span-2">
          <div
            style={{
              boxShadow:
                "0 4px 4px 0 rgba(0, 0, 0, 0.00), 0 7px 12px 0 rgba(0, 0, 0, 0.02)",
            }}
            className="bg-white rounded-xl p-3 sm:p-4 border border-[#D6D6D6] h-full flex flex-col"
          >
            <div className="flex items-start sm:items-center px-[.5rem] justify-between mb-4 sm:mb-6 gap-3">
              <div className="min-w-0">
                <h3 className="font-[500] text-[.875rem] sm:text-[1.125rem] text-gray-900 leading-snug">
                  Score Against Each Subject(%)
                </h3>
                <p className="text-[#757575] text-[.6875rem] sm:text-[.875rem] font-[400] leading-5 mt-0.5">
                  {activeOption.hint}
                </p>
              </div>
              <div className="relative shrink-0" ref={periodRef}>
                <button
                  onClick={() => setPeriodOpen(!periodOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 border border-gray-200 rounded-lg text-[.6875rem] sm:text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors"
                >
                  {activeOption.label}
                  <Icon
                    icon="hugeicons:arrow-down-01"
                    className="w-3 h-3 sm:w-4 sm:h-4"
                  />
                </button>
                {periodOpen && (
                  <div className="absolute right-0 top-full mt-1 w-[8.5rem] sm:w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                    {GRANULARITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setGranularity(option.value);
                          setPeriodOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[.6875rem] sm:text-sm transition-colors ${
                          granularity === option.value
                            ? "bg-[#F3F3F3] text-[#A12161] font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="block">{option.label}</span>
                        <span className="block text-[.625rem] sm:text-xs text-gray-400">
                          {option.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-[220px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[400px] relative">
              {isLoadingSubjectScores && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                  <Icon
                    icon="svg-spinners:ring-resize"
                    className="w-7 h-7 sm:w-8 sm:h-8 text-[#007FFF]"
                  />
                </div>
              )}
              {formattedChartData.length === 0 && !isLoadingSubjectScores ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Icon
                    icon="hugeicons:chart-evaluation"
                    className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mb-2 sm:mb-3"
                  />
                  <p className="text-[#757575] text-[.75rem] sm:text-sm">
                    No score data for this period
                  </p>
                </div>
              ) : (
                <Chart
                  type="area"
                  data={formattedChartData}
                  labelProps={chartLabelProps}
                  prefersToolTip
                  legendInfo={{
                    prefers: true,
                    align: "horizontal",
                    offset: "out-context",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Exams available */}
        <div>
          <div
            style={{
              boxShadow:
                "0 4px 4px 0 rgba(0, 0, 0, 0.00), 0 7px 12px 0 rgba(0, 0, 0, 0.02)",
            }}
            className="bg-white h-full flex flex-col rounded-xl p-3 sm:p-4 border border-[#D6D6D6]"
          >
            <h3 className="font-semibold text-[.875rem] sm:text-base text-gray-900 mb-3 sm:mb-4">
              Exams Available
            </h3>
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1">
                {examsAvailable.map((exam) => {
                  let badgeText = "";
                  let badgeClass = "";

                  if (exam.isCurrent) {
                    badgeText = "Current";
                    badgeClass = "bg-blue-50 text-blue-600";
                  } else if (exam.isPaid) {
                    badgeText = "Active";
                    badgeClass = "bg-green-50 text-green-600";
                  } else if (exam.isDemoAllowed) {
                    badgeText = "Demo";
                    badgeClass = "bg-[#F3F3F3] text-[#A12161]";
                  } else if (!exam.isSubscribed) {
                    badgeText = "Subscribe";
                    badgeClass = "bg-orange-50 text-orange-600";
                  }

                  const canSwitch = exam.isSubscribed || exam.isDemoAllowed;

                  const sharedStyle = {
                    boxShadow:
                      "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                  };

                  const content = (
                    <>
                      <span className="text-[.75rem] sm:text-[1rem] tracking-[-.4px] leading-[1.25rem] sm:leading-[1.5rem] font-medium text-[#2B2B2B] text-center">
                        {exam.name}
                      </span>
                      {isSponsored && !exam.isSubscribed ? (
                        <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#F3F3F3] text-[#757575]">
                          Sponsor only
                        </span>
                      ) : badgeText ? (
                        <span
                          className={`text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${badgeClass}`}
                        >
                          {badgeText}
                        </span>
                      ) : null}
                    </>
                  );

                  if (isSponsored && !canSwitch) {
                    return (
                      <div
                        key={exam.id}
                        style={sharedStyle}
                        className="flex flex-col gap-[.375rem] items-center justify-center p-2.5 sm:p-4 min-h-[6rem] sm:min-h-[10rem] border rounded-[1rem] w-full border-dashed border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed"
                      >
                        {content}
                      </div>
                    );
                  }

                  if (canSwitch) {
                    return (
                      <button
                        key={exam.id}
                        onClick={() => {
                          if (!exam.isCurrent) switchExamType(exam.id);
                        }}
                        disabled={exam.isCurrent}
                        style={sharedStyle}
                        className={`flex flex-col gap-[.375rem] items-center justify-center p-2.5 sm:p-4 min-h-[6rem] sm:min-h-[10rem] border rounded-[1rem] transition-colors w-full ${
                          exam.isCurrent
                            ? "border-blue-300 bg-blue-50/30"
                            : "border-[#D6D6D6] hover:border-blue-200 hover:bg-blue-50/50"
                        }`}
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={exam.id}
                      href={`/student/upgrade?examTypeId=${exam.id}`}
                      style={sharedStyle}
                      className="flex flex-col gap-[.375rem] items-center justify-center p-2.5 sm:p-4 min-h-[6rem] sm:min-h-[10rem] border rounded-[1rem] transition-colors w-full border-dashed border-gray-300 hover:border-orange-300 hover:bg-orange-50/30"
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/student/syllabus"
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-blue-500 text-[.75rem] sm:text-sm font-medium mt-3 sm:mt-4 hover:underline"
              >
                View Syllabus
                <Icon
                  icon="hugeicons:arrow-right-01"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
