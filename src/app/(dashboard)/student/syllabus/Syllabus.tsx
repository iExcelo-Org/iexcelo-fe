"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

const syllabusSubjects = [
  "Use of English",
  "History",
  "Biology",
  "Chemistry",
  "Physics",
  "Geography",
  "Mathematics",
  "Physical Education",
  "Computer Science",
  "Music",
  "Financial Accounting",
  "Commerce",
  "Agricultural Science",
];

export default function Syllabus() {
  return (
    <div className="p-4 md:p-6">
      <Link
        href="/student"
        className="inline-flex items-center gap-1 text-blue-500 text-sm font-medium mb-4 hover:underline"
      >
        <Icon icon="hugeicons:arrow-left-01" className="w-4 h-4" />
        Go Back
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Icon
              icon="hugeicons:mortarboard-01"
              className="w-5 h-5 text-green-600"
            />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            JAMB(UTME) SYLLABUS
          </h1>
        </div>

        <div className="divide-y divide-gray-100">
          {syllabusSubjects.map((subject) => (
            <Link
              key={subject}
              href={`/student/syllabus/${subject.toLowerCase().replace(/ /g, "-")}`}
              className="flex items-center justify-between p-4 md:px-6 hover:bg-gray-50 transition-colors"
            >
              <span className="text-pink-500 font-medium">{subject}</span>
              <Icon
                icon="hugeicons:arrow-right-01"
                className="w-5 h-5 text-pink-500"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
