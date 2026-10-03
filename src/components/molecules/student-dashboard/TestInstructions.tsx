"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";

interface TestInstructionsProps {
  examType: string;
  subjects: string[];
  duration: string;
  questionCount: number;
  userName: string;
  onGoBack: () => void;
  onAttemptTest: () => void;
  isAttempting?: boolean;
}

export function TestInstructions({
  examType,
  subjects,
  duration,
  questionCount,
  userName,
  onGoBack,
  onAttemptTest,
  isAttempting,
}: TestInstructionsProps) {
  return (
    <Modal isOpen className="rounded-2xl w-full max-w-2xl p-4 sm:p-6 md:p-8">
        <h1 className="text-base sm:text-xl font-semibold text-blue-500 mb-4 sm:mb-6">
          Welcome, {userName}
        </h1>
        <hr className="mb-4 sm:mb-6 text-[#DCDFE4]" />

        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
          Test Instructions
        </h2>
        <p className="text-sm text-gray-500 mb-4 sm:mb-6">
          Please read carefully before starting
        </p>

        <div className="space-y-3 mb-4 sm:mb-6">
          <div className="flex gap-3">
            <span className="text-sm text-gray-500 w-20 sm:w-24 shrink-0">Exam Type:</span>
            <span className="text-sm font-medium text-gray-900">
              {examType}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-sm text-gray-500 w-20 sm:w-24 shrink-0">Subject:</span>
            <span className="text-sm font-medium text-gray-900">
              {subjects.join(", ")}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-sm text-gray-500 w-20 sm:w-24 shrink-0">Duration:</span>
            <span className="text-sm font-medium text-gray-900">
              {duration}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-sm text-gray-500 w-20 sm:w-24 shrink-0">Questions:</span>
            <span className="text-sm font-medium text-gray-900">
              {questionCount} Questions
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-6 sm:mb-8">
          <div className="flex items-start gap-2 text-red-500">
            <Icon
              icon="hugeicons:checkmark-circle-02"
              className="w-4 h-4 mt-0.5 flex-shrink-0"
            />
            <span className="text-sm">Read Each Question Carefully</span>
          </div>
          <div className="flex items-start gap-2 text-red-500">
            <Icon
              icon="hugeicons:checkmark-circle-02"
              className="w-4 h-4 mt-0.5 flex-shrink-0"
            />
            <span className="text-sm">
              Each question has only one correct answer. Click on your choice to
              select it.
            </span>
          </div>
          <div className="flex items-start gap-2 text-red-500">
            <Icon
              icon="hugeicons:checkmark-circle-02"
              className="w-4 h-4 mt-0.5 flex-shrink-0"
            />
            <span className="text-sm">
              After answering the last question, click &quot;Finish Exam&quot;
              to submit and view your results.
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button variant="outlined" onClick={onGoBack} className="justify-center">
            Go back
          </Button>
          <Button onClick={onAttemptTest} loading={isAttempting} className="justify-center">
            Attempt Test
          </Button>
        </div>
    </Modal>
  );
}
