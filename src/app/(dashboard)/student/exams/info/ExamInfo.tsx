"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/atoms";
import { useRouter } from "next/navigation";
import { countdownFromMs } from "@/utils";

export default function ExamInfo() {
  const router = useRouter();
  const [examDate, setExamDate] = useState("2026-04-17");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(examDate).getTime();

    const interval = setInterval(() => {
      const result = countdownFromMs(targetDate - Date.now());
      if (result) setTimeLeft(result);
    }, 1000);

    return () => clearInterval(interval);
  }, [examDate]);

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <button className="flex items-center gap-2 text-xl font-bold text-gray-900">
            JAMB UTME
            <Icon icon="hugeicons:arrow-down-01" className="w-5 h-5" />
          </button>
          <div className="mt-4 sm:mt-0">
            <span className="text-sm text-gray-500 mr-2">
              Current Exam Subscription:
            </span>
            <span className="bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              UTME
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Select Exam Date
            </label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon
                  icon="hugeicons:calendar-03"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <Button className="py-2.5">Update</Button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Exam starts 17th April 2026
            </p>
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-500">
              <span>{String(timeLeft.days).padStart(2, "0")}</span>
              <span className="text-gray-300">:</span>
              <span>{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className="text-gray-300">:</span>
              <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className="text-gray-300">:</span>
              <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-blue-500 mt-1">
              <span>Days</span>
              <span>Hours</span>
              <span>Minutes</span>
              <span>Seconds</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 leading-relaxed mb-4">
              The Joint Admission and Matriculation Board (JAMB) Unify Tertiary
              Matriculation Examination (UTME) is a standardized examination in
              Nigeria that is used to assess the academic abilities and
              readiness of candidates seeking admission into tertiary
              institutions.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              It is a <strong>computer-based test</strong> that comprises four
              subjects, including the{" "}
              <span className="text-blue-500">
                English language, and three other subjects
              </span>{" "}
              that correspond to the candidate&apos;s chosen course of study.
            </p>
            <p className="text-gray-900 font-semibold mb-4">
              The test consists of 180 multiple-choice questions and is
              administered over a period of two to three hours.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              We know that UTME is a highly competitive examination; that&apos;s
              why we step in to help you prepare for and pass this examination.
              We have thousands of revision or practice questions that were
              selected from various past questions of UTME in the last 20 years,
              and we have taken into consideration the most recurring questions.
            </p>

            <h3 className="text-gray-900 font-semibold mb-3">
              Key benefits include:
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                Our experts in various fields have given explanations for every
                answer to ensure the veracity of the information you are
                getting.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                There are summaries of topics addressed by each question in
                every subject. This enables you to search for any topics and
                read more about them.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                You see your real-time performance and progression score; this
                gives you assurance of your readiness for the examination.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                You see your real-time performance as compared with other
                candidates sitting for the same examination. This is designed to
                encourage you if you are doing well and to make you study more
                if you are lagging behind your peers.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                You can select and revise questions on a topic basis, which
                ensures you can focus on the areas of your weakness in any topic
                at a time.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                Questions can be answered in revision, timed, and mock modes.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                CBT simulation with all JAMB UTME CBT keys. This means there is
                no need to spend extra money to learn how to do computer-based
                examinations.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                In-built data-saving software means low data usage for you.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                You get 24/7 uninterrupted access anywhere you are using any
                device.
              </li>
            </ul>
          </div>

          <div className="flex justify-center mt-8">
            <Button
              onClick={() => router.push("/student/exams")}
              className="w-full max-w-md"
            >
              Start Exam
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
