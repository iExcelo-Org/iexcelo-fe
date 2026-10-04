"use client";

import { Fragment, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Table } from "@/components/molecules";
import { useAuthStore, useStudentStore } from "@/store";
import {
  formatDateTime,
  formatTimeFromSeconds,
  capitalize,
  RECORDS_PER_PAGE,
} from "@/utils";

const History = () => {
  const { accessToken } = useAuthStore();
  const {
    examHistory,
    examHistoryTotal,
    examHistoryPage,
    isLoadingExamHistory,
    fetchExamHistory,
  } = useStudentStore();

  useEffect(() => {
    if (!accessToken) return;
    fetchExamHistory(1, RECORDS_PER_PAGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const totalPages = Math.ceil(examHistoryTotal / RECORDS_PER_PAGE);

  const tableData =
    examHistory?.map((attempt) => [
      attempt.examTypeName,
      capitalize(attempt.mode),
      formatDateTime(attempt.startedAt),
      attempt.totalQuestions,
      { score: attempt.scorePercentage, category: attempt.category },
      formatTimeFromSeconds(attempt.timeSpentSeconds),
      attempt.id,
    ]) ?? [];

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-[600] text-[#171717]">Exam History</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Review your past exam attempts and track your progress over time
        </p>
      </div>

      <Table
        columns={[
          "Exam Type",
          "Mode",
          "Date Attempted",
          "Total Questions",
          {
            title: "Total Score",
            customTableBody: (cell: { score: number; category: string | null }) => {
              const hideScore =
                cell.category === "theory" || cell.category === "practical";
              if (hideScore) return <span className="text-xs text-gray-400">N/A</span>;
              return (
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    cell.score < 50
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {cell.score.toFixed(1)}%
                </span>
              );
            },
          },
          "Time Used",
          {
            title: "Action",
            isHead: true,
            customTableBody: (id: string) => (
              <Link
                href={`/student/history/${id}`}
                className="text-blue-500 text-sm font-medium hover:underline"
              >
                Review
              </Link>
            ),
          },
        ]}
        data={tableData}
        pagination={true}
        loading={isLoadingExamHistory}
        metaData={{
          endPage: totalPages,
          currentPage: examHistoryPage,
          totalRecords: examHistoryTotal,
          onPageChange: (skip: number) => {
            const newPage = Math.floor(skip / RECORDS_PER_PAGE) + 1;
            fetchExamHistory(newPage, RECORDS_PER_PAGE);
          },
        }}
        recordsPerPage={RECORDS_PER_PAGE}
        customResponsiveSkeleton={
          <>
            {Array.from({ length: 8 }, (_, i) => (
              <Fragment key={i}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="h-3.5 w-28 bg-gray-200 rounded" />
                    <div className="h-2.5 w-40 bg-gray-100 rounded" />
                    <div className="h-2.5 w-20 bg-gray-100 rounded" />
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="h-5 w-12 bg-gray-200 rounded-full" />
                    <div className="h-2.5 w-10 bg-gray-100 rounded" />
                  </div>
                </div>
                {i < 7 && (
                  <div className="px-6 sm:px-8">
                    <div className="h-px bg-[#F2F4F7]" />
                  </div>
                )}
              </Fragment>
            ))}
          </>
        }
        customResponsiveBody={(row, rowIndex) => {
          const [examType, mode, date, totalQ, scoreData, timeUsed, id] = row as [
            string, string, string, number,
            { score: number; category: string | null },
            string, string,
          ];
          const hideScore = scoreData.category === "theory" || scoreData.category === "practical";
          const modeColors: Record<string, string> = { Revision: "#007FFF", Timed: "#F3A218", Mock: "#A12161" };
          const modeIcons: Record<string, string> = {
            Revision: "hugeicons:book-open-02",
            Timed: "hugeicons:clock-02",
            Mock: "hugeicons:layout-grid-01",
          };
          const color = modeColors[mode] ?? "#667085";
          const icon = modeIcons[mode] ?? "hugeicons:exam-01";
          return (
            <div key={rowIndex} className="flex items-center gap-3 px-4 py-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}18`, color }}
              >
                <Icon icon={icon} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[.8125rem] font-[600] text-[#171717] truncate">{examType}</p>
                <p className="text-[.6875rem] text-[#667085] mt-0.5">{mode} · {date}</p>
                <p className="text-[.6875rem] text-[#667085]">{totalQ} Qs · {timeUsed}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {!hideScore ? (
                  <span
                    className={`text-[.6875rem] font-semibold px-2 py-0.5 rounded-full ${
                      scoreData.score < 50 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                    }`}
                  >
                    {scoreData.score.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-[.6875rem] text-gray-400">N/A</span>
                )}
                <Link href={`/student/history/${id}`} className="text-[.6875rem] font-[600] text-[#007FFF]">
                  Review
                </Link>
              </div>
            </div>
          );
        }}
        emptyStateProps={{
          svg: "hugeicons:shopping-cart-02",
          title: "No exam history yet",
          text: "Your completed exams will appear here. Start an exam to build your history.",
        }}
      />
    </section>
  );
};

export default History;
