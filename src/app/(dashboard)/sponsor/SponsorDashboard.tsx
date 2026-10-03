"use client";

import { Icon } from "@iconify/react";
import { CARD_SHADOW, CURRENCY_SYMBOLS } from "@/utils";
import { cn } from "@/lib/utils";
import { Button, StatusChip } from "@/components/atoms";
import { useAuthStore, useSponsorStore } from "@/store";
import { useEffect } from "react";
import Link from "next/link";
import SponsorDashboardSkeleton from "./SponsorDashboardSkeleton";

function daysLeft(endDate: string | null | undefined): string {
  if (!endDate) return "—";
  const diff = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff <= 0) return "Expired";
  return `${diff} day${diff === 1 ? "" : "s"}`;
}

export default function SponsorDashboard() {
  const { user, accessToken } = useAuthStore();
  const { dashboard, isLoadingDashboard, fetchDashboard } = useSponsorStore();

  useEffect(() => {
    if (!accessToken) return;
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (isLoadingDashboard && !dashboard) {
    return <SponsorDashboardSkeleton />;
  }

  const givebacksUp = (dashboard?.givebacksChange ?? 0) >= 0;
  const inactiveStudents =
    (dashboard?.studentsEnrolled ?? 0) - (dashboard?.activeStudents ?? 0);

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      <div className="flex mb-5.5 flex-col xl:flex-row xl:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.lastLoginAt
              ? `Last login: ${new Date(user.lastLoginAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at ${new Date(user.lastLoginAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
              : "Welcome to your sponsor dashboard"}
          </p>
        </div>
      </div>

      <section className="grid gap-6 grid-cols-3">
        {/* Card 1: Total GiveBacks */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
        >
          <div className="w-full">
            <div className="bg-[#E5E8F8] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
              <Icon
                icon="hugeicons:healtcare"
                height="1.5rem"
                width="1.5rem"
                className="text-[#007FFF]"
              />
            </div>
            <div className="flex mb-1 items-center gap-3">
              <p className="text-[#575757] text-sm">Total GiveBacks</p>
            </div>
            <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {dashboard?.totalGivebacks ?? 0}
            </p>
            <div className="flex gap-[.25rem] items-center">
              <span
                className={cn(
                  "p-[.125rem_.375rem] text-[.75rem] flex items-center gap-[.25rem] rounded-[.625rem] leading-5 font-[500]",
                  givebacksUp
                    ? "bg-[#E7F6EC] text-[#036B26]"
                    : "bg-[#FBEAE9] text-[#D42620]",
                )}
              >
                <Icon
                  icon={
                    givebacksUp
                      ? "hugeicons:arrow-up-right-01"
                      : "hugeicons:arrow-down-left-01"
                  }
                  className="w-4 h-4"
                />
                {Math.abs(dashboard?.givebacksChange ?? 0)}%
              </span>
              <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                from last month
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Students Enrolled */}
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
            <p className="text-[#575757] text-sm mb-1">Students Enrolled</p>
            <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {dashboard?.studentsEnrolled ?? 0}
            </p>
            <div className="flex gap-[.25rem] items-center">
              <span className="p-[.125rem_.375rem] text-[.75rem] flex items-center gap-[.25rem] rounded-[.625rem] leading-5 font-[500] bg-[#E7F6EC] text-[#036B26]">
                {dashboard?.activeStudents ?? 0} Active
              </span>
              <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                {inactiveStudents} Inactive
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Exams Completed */}
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
            <p className="text-[#575757] text-sm mb-1">Exams Completed</p>
            <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {dashboard?.examsCompleted ?? 0}
            </p>
            <div className="flex gap-[.25rem] items-center">
              <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                Avg Score: {(dashboard?.avgScore ?? 0).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex mt-5 justify-between items-center gap-[1.25rem]">
        {/* Active Givebacks */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="h-94.5 w-[68%] border border-[#D6D6D6] flex flex-col rounded-[.75rem]"
        >
          <div className="flex gap-1 p-[2rem_1.5rem_1rem_1.5rem] flex-col">
            <h4 className="font-[500] text-[#2B2B2B] text-[1.25rem]">
              Recent GiveBacks
            </h4>
            <p className="text-[#757575] font-[400] leading-5 text-[1.125rem]">
              Your latest sponsorship activity
            </p>
          </div>
          <div className="p-[1.125rem_1.5rem] flex-col flex gap-3 overflow-y-auto flex-1">
            {(dashboard?.recentGivebacks ?? []).length === 0 ? (
              <p className="text-center text-[#757575] text-sm py-8">
                No givebacks yet
              </p>
            ) : (
              (dashboard?.recentGivebacks ?? []).map((giveback) => {
                const sub = giveback.subscription;
                const currency =
                  CURRENCY_SYMBOLS[giveback.currency] ?? giveback.currency;
                const left = daysLeft(sub?.endDate);
                const isExpired = left === "Expired";
                return (
                  <div
                    key={giveback.id}
                    style={{
                      boxShadow: `0px 5px 22px 0px rgba(0, 0, 0, 0.04)`,
                    }}
                    className="p-[.75rem_1rem] flex justify-between items-stretch bg-white rounded-[.625rem]"
                  >
                    <div className="flex flex-col justify-between items-center gap-1">
                      <span className="text-[#757575] text-[.875rem] leading-5 font-[400]">
                        Exam
                      </span>
                      <span className="bg-[#41BCE2] p-[.125rem_.375rem] rounded-[999999px] tracking-[-.5%] text-[.75rem] text-white font-[500]">
                        {sub?.examType?.name ?? "—"}
                      </span>
                    </div>
                    <div className="flex flex-col justify-between gap-1">
                      <span className="text-[#757575] text-[.875rem] font-[400] leading-5">
                        Amount
                      </span>
                      <span className="leading-5 text-[.875rem] font-[400] text-[#2B2B2B]">
                        {currency}
                        {giveback.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col justify-between gap-1">
                      <span className="text-[#757575] text-[.875rem] font-[400] leading-5">
                        Plan
                      </span>
                      <span className="leading-5 text-[.875rem] font-[400] text-[#2B2B2B]">
                        {sub?.plan?.name ?? "—"}
                      </span>
                    </div>
                    <div className="flex flex-col justify-between gap-1">
                      <span className="text-[#757575] text-[.875rem] font-[400] leading-5">
                        Days Left
                      </span>
                      <span
                        className={cn(
                          "leading-5 text-[.875rem] font-[400]",
                          isExpired ? "text-[#D42620]" : "text-[#0F973D]",
                        )}
                      >
                        {left}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="h-94.5 w-[30%] border border-[#D6D6D6] flex flex-col rounded-[.75rem]"
        >
          <h4 className="font-[500] p-[2rem_1.5rem_1rem_1.5rem] text-[#2B2B2B] text-[1.25rem]">
            Quick Actions
          </h4>
          <div className="grid flex-1 gap-[.75rem_.5rem] grid-cols-2 p-5">
            <Link
              href="/sponsor/students"
              className="col-span-2 bg-[#FFECE5] rounded-[.75rem] items-center justify-center gap-4 flex flex-col min-h-25 py-3"
            >
              <Icon
                className="w-6 h-6 text-[#EB5017]"
                icon={"hugeicons:graduate-male"}
              />
              <span className="text-[#2B2B2B] leading-6 font-[500] text-[1rem]">
                Add Students
              </span>
            </Link>
            <Link
              href="/sponsor/giveback"
              className="bg-[#E6E6F1] rounded-[.75rem] items-center justify-center gap-4 flex flex-col min-h-25 py-3"
            >
              <Icon
                className="w-6 h-6 text-[#000077]"
                icon={"hugeicons:clock-01"}
              />
              <span className="text-[#2B2B2B] leading-6 font-[500] text-[1rem]">
                View History
              </span>
            </Link>
            <Link
              href="/sponsor/students"
              className="bg-[#E5E8F8] rounded-[.75rem] items-center justify-center gap-4 flex flex-col min-h-25 py-3"
            >
              <Icon
                className="w-6 h-6 text-[#007FFF]"
                icon={"hugeicons:user-group-03"}
              />
              <span className="text-[#2B2B2B] leading-6 font-[500] text-[1rem]">
                Manage Students
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Added Students */}
      <section
        style={{ boxShadow: CARD_SHADOW }}
        className="max-h-100.25 mt-5 border border-[#D6D6D6] flex flex-col rounded-[.75rem]"
      >
        <div className="flex p-[2rem_1.5rem_1rem_1.5rem] items-center justify-between">
          <div className="flex gap-1 flex-col">
            <h4 className="font-[500] text-[#2B2B2B] text-[1.25rem]">
              Recently Added Students
            </h4>
            <p className="text-[#757575] font-[400] leading-5 text-[1.125rem]">
              Students recently added to your sponsor list
            </p>
          </div>
          <Link href="/sponsor/students">
            <Button variant="outlined">View All Students</Button>
          </Link>
        </div>
        <div className="p-[1.125rem_1.5rem] flex-col flex gap-3 overflow-y-auto flex-1">
          {(dashboard?.recentStudents ?? []).length === 0 ? (
            <p className="h-50 flex items-center justify-center text-[#757575] text-sm py-8">
              No students added yet
            </p>
          ) : (
            (dashboard?.recentStudents ?? []).map((student) => (
              <div
                key={student.id}
                style={{
                  boxShadow: `0px 5px 22px 0px rgba(0, 0, 0, 0.04)`,
                }}
                className="p-4 flex justify-between items-stretch bg-white rounded-[.625rem]"
              >
                <div className="flex flex-col justify-between gap-1">
                  <span className="text-[#2B2B2B] text-[1rem] leading-6 font-[600]">
                    {student.firstName} {student.lastName}
                  </span>
                  <span className="text-[1rem] text-[#757575] leading-6 font-[400]">
                    {student.email}
                  </span>
                </div>
                <div className="flex flex-col justify-between items-end gap-2">
                  <span className="text-[#2B2B2B] text-[1rem] leading-6 font-[600]">
                    {new Date(student.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <StatusChip
                    id={student.isActive as unknown as string}
                    type="acc_stat"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
