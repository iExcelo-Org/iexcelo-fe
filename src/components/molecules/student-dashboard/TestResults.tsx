/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/atoms";

interface TestResultsProps {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  timeUsed?: string;
  hideScore?: boolean;
  /** Omit to hide the "Review Test" button (e.g. mock exams — review happens before submit). */
  onReviewTest?: () => void;
  onReturnToMain: () => void;
}

export function TestResults({
  totalQuestions,
  answeredQuestions,
  correctAnswers,
  incorrectAnswers,
  unattempted,
  score,
  timeUsed,
  hideScore = false,
  onReviewTest,
  onReturnToMain,
}: TestResultsProps) {
  return (
    <section className="min-h-screen bg-white flex items-center justify-center p-4">
      <div
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="rounded-[1.5rem] w-full max-w-2xl py-6 px-4 sm:py-10 sm:px-8"
      >
        <img
          alt="Success GIF"
          src={"/gif/success.gif"}
          className="w-24 sm:w-33 mx-auto"
        />
        <h1 className="text-[#2B2B2B] text-[1.125rem] sm:text-[1.5rem] leading-7 sm:leading-8 font-[600] text-center tracking-[-.48px] mb-4 sm:mb-6">
          Answers Submitted Successfully!
        </h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <h4 className="tracking-[-.48px] font-[600] leading-7 sm:leading-8 text-[1.125rem] sm:text-[1.5rem] text-[#2B2B2B]">
              Summary
            </h4>
            <div className="flex flex-col gap-2 sm:gap-3">
              <p className="tracking-[-.4px] leading-5 text-[1rem] sm:text-[1.25rem] font-[600] text-[#2B2B2B]">
                Total Questions:{" "}
                <span className="text-[#757575]">{totalQuestions}</span>
              </p>
              <p className="tracking-[-.4px] leading-5 text-[1rem] sm:text-[1.25rem] font-[600] text-[#2B2B2B]">
                Answered Questions:{" "}
                <span className="text-[#757575]">{answeredQuestions}</span>
              </p>
              {!hideScore && (
                <p className="tracking-[-.4px] leading-5 text-[1rem] sm:text-[1.25rem] font-[600] text-[#2B2B2B]">
                  Correct Answers:{" "}
                  <span className="text-[#0F973D]">{correctAnswers}</span>
                </p>
              )}
              {!hideScore && (
                <p className="tracking-[-.4px] leading-5 text-[1rem] sm:text-[1.25rem] font-[600] text-[#2B2B2B]">
                  Incorrect Answers:{" "}
                  <span className="text-[#D42620]">{incorrectAnswers}</span>
                </p>
              )}
              <p className="tracking-[-.4px] leading-5 text-[1rem] sm:text-[1.25rem] font-[600] text-[#2B2B2B]">
                Unattempted Questions:{" "}
                <span className="text-[#757575]">{unattempted}</span>
              </p>
              {timeUsed && (
                <p className="tracking-[-.4px] leading-5 text-[1rem] sm:text-[1.25rem] font-[600] text-[#2B2B2B]">
                  Time Used: <span className="text-[#757575]">{timeUsed}</span>
                </p>
              )}
            </div>
          </div>
          {!hideScore && (
            <div className="flex w-full sm:w-fit flex-col items-center border p-[.75rem_1.5rem] sm:p-[1rem_2rem] bg-[#F3F3F3] rounded-[1rem] text-[#E32E89] border-[#E32E89] gap-2">
              <span className="text-[1.125rem] sm:text-[1.5rem] tracking-[-.48px] leading-7 sm:leading-8 font-[600]">
                Score
              </span>
              <span className="text-[1.75rem] sm:text-[2.25rem] tracking-[-.72px] font-[500]">
                {Math.round(score)}%
              </span>
            </div>
          )}
        </div>

        <hr className="my-6 sm:my-8 text-[#EDEDED]" />

        <div className="flex flex-col justify-center sm:flex-row gap-3 sm:gap-4">
          {onReviewTest && (
            <Button
              variant="outlined"
              onClick={onReviewTest}
              className="w-full sm:w-auto justify-center"
            >
              Review Test
            </Button>
          )}
          <Button
            onClick={onReturnToMain}
            className="w-full sm:w-auto justify-center"
          >
            Return to Main Window
          </Button>
        </div>
      </div>
    </section>
  );
}
