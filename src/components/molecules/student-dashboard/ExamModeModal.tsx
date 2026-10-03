"use client";

import { ChangeEvent, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/atoms";
import { Modal, InputField } from "@/components/molecules";
import { EXAM_QUESTION_OPTIONS, EXAM_TIME_OPTIONS } from "@/utils";
import type { IMockConfig } from "@/types";

interface ExamModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "revision" | "timed" | "mock";
  examTypeName: string;
  subjects: string[];
  isDemoUser: boolean;
  freeTierLimit: number;
  onContinue: (numQuestions?: number, time?: number) => void;
  mockConfig?: IMockConfig | null;
  isLoadingMockConfig?: boolean;
  mockDuration?: string;
}

const MODE_TITLE: Record<ExamModeModalProps["mode"], string> = {
  revision: "Revision Mode",
  timed: "Timed Mode",
  mock: "Mock Mode",
};

export function ExamModeModal({
  isOpen,
  onClose,
  mode,
  examTypeName,
  subjects,
  isDemoUser,
  freeTierLimit,
  onContinue,
  mockConfig,
  isLoadingMockConfig,
  mockDuration,
}: ExamModeModalProps) {
  const [numQuestions, setNumQuestions] = useState<number | "">("");
  const [time, setTime] = useState<number | null>(null);

  const questionOptions = isDemoUser
    ? EXAM_QUESTION_OPTIONS.filter((o) => o.value <= freeTierLimit)
    : EXAM_QUESTION_OPTIONS;

  const handleContinue = () => {
    if (mode === "revision") {
      if (!numQuestions) return;
      const capped = isDemoUser
        ? Math.min(numQuestions as number, freeTierLimit)
        : (numQuestions as number);
      onContinue(capped);
    } else if (mode === "timed") {
      if (!numQuestions || !time) return;
      onContinue(numQuestions as number, time);
    } else {
      onContinue();
    }
  };

  const isContinueDisabled =
    mode === "revision"
      ? !numQuestions
      : mode === "timed"
        ? !numQuestions || !time
        : false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="rounded-2xl w-full max-w-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          {MODE_TITLE[mode]}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <Icon icon="hugeicons:cancel-01" className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {/* Demo user warning */}
        {isDemoUser && mode !== "mock" && (
          <div className="bg-[#FEF6E7] border-l-4 border-[#F3A218] mb-4 p-[.75rem_1rem]">
            <div className="flex items-center gap-2">
              <Icon
                icon="hugeicons:information-circle"
                className="w-5 h-5 text-[#F3A218] flex-shrink-0 mt-0.5"
              />
              <p className="text-[.8125rem] sm:text-[.875rem] font-[600] leading-5 text-[#2B2B2B]">
                You only have access to {freeTierLimit} Questions!
              </p>
            </div>
          </div>
        )}

        {/* Subjects card */}
        <div className="border border-[#41BCE2] rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 bg-[#F1FCFF]">
          <div className="flex items-start gap-2">
            <Icon
              icon="hugeicons:book-open-02"
              className="w-6 h-6 sm:w-7.5 sm:h-7.5 shrink-0 mt-0.5"
              color="#41BCE2"
            />
            <div className="flex flex-col gap-2 sm:gap-4 min-w-0">
              <h4 className="font-[400] text-[.875rem] sm:text-[1rem] text-[#575757] leading-[1.5rem]">
                {examTypeName} Subjects
              </h4>
              <div className="space-y-1.5 sm:space-y-2">
                {subjects.map((subject) => (
                  <p
                    key={subject}
                    className="text-[#2B2B2B] text-[.9375rem] sm:text-[1.125rem] leading-[1.5rem] sm:leading-[1.75rem] font-[500] break-words"
                  >
                    {subject}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mode-specific content */}
        {mode === "revision" && (
          <div className="mb-5 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Number of questions you want to answer
            </label>
            <InputField
              type="number"
              label={null}
              value={numQuestions}
              onChange={(
                e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) =>
                setNumQuestions(
                  e.target.value ? Number.parseInt(e.target.value) : "",
                )
              }
              placeholder={
                isDemoUser
                  ? `Enter no. of questions (max ${freeTierLimit})`
                  : "Enter no. of questions"
              }
            />
          </div>
        )}

        {mode === "timed" && (
          <>
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Number of questions you want to answer
              </label>
              <InputField
                type="select"
                selectOptions={questionOptions}
                onChange={(
                  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                ) => setNumQuestions(Number(e?.target?.value))}
                label={null}
                placeholder="Select no. of questions"
              />
            </div>
            <div className="mb-5 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <InputField
                type="select"
                selectOptions={EXAM_TIME_OPTIONS}
                onChange={(
                  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                ) => setTime(Number(e?.target?.value))}
                label={null}
                placeholder="Select your preferred time"
              />
            </div>
          </>
        )}

        {mode === "mock" && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Icon
                  icon="hugeicons:notebook-02"
                  className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 shrink-0"
                />
                <span className="text-[.6875rem] sm:text-xs text-gray-500">Total Questions</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 pl-[1.375rem] sm:pl-7">
                {isLoadingMockConfig
                  ? "..."
                  : (mockConfig?.standardQuestionCount ?? 60)}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Icon
                  icon="hugeicons:clock-01"
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0"
                />
                <span className="text-[.6875rem] sm:text-xs text-gray-500">Exam Duration</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 pl-[1.375rem] sm:pl-7">
                {isLoadingMockConfig ? "..." : mockDuration}
              </p>
            </div>
          </div>
        )}

        <Button onClick={handleContinue} disabled={isContinueDisabled} className="w-full justify-center">
          Continue
        </Button>
      </div>
    </Modal>
  );
}
