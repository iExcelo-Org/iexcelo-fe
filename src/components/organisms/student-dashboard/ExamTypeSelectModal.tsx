"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "../../atoms";
import { Modal, InputField } from "@/components/molecules";
import { useStudentStore } from "@/store";

interface ExamTypeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExamTypeSelectModal({
  isOpen,
  onClose,
}: ExamTypeSelectModalProps) {
  const router = useRouter();
  const { dashboardData } = useStudentStore();
  const [selectedExamTypeId, setSelectedExamTypeId] = useState<string>("");

  // Get all available exams and filter out already-paid ones
  const unpaidExamTypes = useMemo(() => {
    const examsAvailable = dashboardData?.examsAvailable || [];
    return examsAvailable.filter((exam) => !exam.isPaid);
  }, [dashboardData?.examsAvailable]);

  const handleSubmit = () => {
    if (!selectedExamTypeId) return;
    router.push(`/student/upgrade?examTypeId=${selectedExamTypeId}`);
    onClose();
  };

  // If all exams are already paid, show a different message
  if (unpaidExamTypes.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} zIndex="z-[200]" className="rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-gray-900">All Set!</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon icon="hugeicons:cancel-01" className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 md:p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon
                icon="hugeicons:tick-02"
                className="w-8 h-8 text-green-500"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              You&apos;re Already Premium!
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              You have active subscriptions for all available exam types. Enjoy
              unlimited access to all features and content.
            </p>
            <Button onClick={onClose}>Got it</Button>
          </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} zIndex="z-[300]" className="rounded-2xl w-full max-w-md">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            Upgrade Your Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon icon="hugeicons:cancel-01" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Icon
                  icon="hugeicons:diamond-02"
                  className="w-5 h-5 text-pink-500"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Go Premium
              </h3>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Select the exam type you want to upgrade to premium. You&apos;ll get
            unlimited access to all features and content for that exam.
          </p>

          <div className="space-y-4">
            <InputField
              label="Select Exam Type"
              type="select"
              placeholder="Choose an exam type"
              value={selectedExamTypeId}
              selectOptions={unpaidExamTypes.map((exam) => ({
                value: exam.id,
                label: exam.name,
              }))}
              onChange={(e: { target: { value: string } }) => {
                setSelectedExamTypeId(e.target.value);
              }}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedExamTypeId}>
              Continue
            </Button>
          </div>
      </div>
    </Modal>
  );
}
