"use client";

import { useEffect } from "react";
import Link from "next/link";
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
