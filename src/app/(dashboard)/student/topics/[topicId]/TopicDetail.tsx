"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { ContentRenderer } from "@/components/atoms";
import { useExamStore } from "@/store";
import { useExamProtection } from "@/hooks";
import Link from "next/link";

const SHADOW = "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)";

function estimateReadingTime(content: string | null): string {
  if (!content) return "< 1 min read";
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TopicDetailSkeleton() {
  return (
    <section className="px-[.875rem] sm:px-[1.25rem] xl:px-[2rem] py-[1.25rem] mx-auto max-w-3xl animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-28 mb-6" />
      <div className="rounded-2xl overflow-hidden mb-6" style={{ boxShadow: SHADOW }}>
        <div className="bg-gray-200 h-44 w-full" />
        <div className="bg-white px-6 py-4 md:px-10 flex gap-4">
          <div className="h-3.5 bg-gray-100 rounded w-28" />
          <div className="h-3.5 bg-gray-100 rounded w-28" />
          <div className="h-3.5 bg-gray-100 rounded w-20" />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 md:p-10 space-y-3" style={{ boxShadow: SHADOW }}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-100 rounded"
            style={{ width: `${75 + (i % 4) * 6}%` }}
          />
        ))}
      </div>
    </section>
  );
}

export default function TopicDetail() {
  const { topicId } = useParams<{ topicId: string }>();
  const { topicDetail, isLoadingTopicDetail, fetchTopicDetail } = useExamStore();
  useExamProtection(true, false);

  useEffect(() => {
    if (topicId) fetchTopicDetail(topicId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  if (isLoadingTopicDetail) return <TopicDetailSkeleton />;

  if (!topicDetail) {
    return (
      <section className="px-[.875rem] sm:px-[1.25rem] xl:px-[2rem] py-[1.25rem] mx-auto max-w-3xl">
        <p className="text-gray-400 text-center py-16">Topic not found.</p>
      </section>
    );
  }

  const readingTime = estimateReadingTime(topicDetail.content);

  return (
    <section className="px-[.875rem] sm:px-[1.25rem] xl:px-[2rem] py-[1.25rem] mx-auto max-w-3xl">
      {/* Back link */}
      <Link
        href="/student/topics"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#007FFF] mb-6 transition-colors"
      >
        <Icon icon="hugeicons:arrow-left-01" className="w-4 h-4" />
        Back to Topics
      </Link>

      {/* Hero header */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ boxShadow: SHADOW }}>
        {/* Gradient banner */}
        <div className="relative bg-gradient-to-br from-[#007FFF] via-[#0070E0] to-[#0050B3] px-6 pt-8 pb-10 md:px-10 md:pt-10 md:pb-12 overflow-hidden">
          {/* Dot pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1.5px, transparent 1.5px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Subject badge */}
          {topicDetail.subjectName && (
            <span className="relative inline-flex items-center gap-1.5 bg-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              <Icon icon="hugeicons:book-open-01" className="w-3.5 h-3.5" />
              {topicDetail.subjectName}
            </span>
          )}

          {/* Title */}
          <h1 className="relative text-2xl md:text-[1.75rem] font-bold text-white leading-tight tracking-tight">
            {topicDetail.name}
          </h1>
        </div>

        {/* Meta strip */}
        <div className="bg-white px-6 py-3.5 md:px-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100">
              {topicDetail.createdAt && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Icon icon="hugeicons:calendar-add-01" className="w-3.5 h-3.5 text-gray-400" />
              Created {formatDate(topicDetail.createdAt)}
            </span>
          )}
          {topicDetail.updatedAt && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Icon icon="hugeicons:pencil-edit-02" className="w-3.5 h-3.5 text-gray-400" />
              Updated {formatDate(topicDetail.updatedAt)}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon icon="hugeicons:clock-01" className="w-3.5 h-3.5 text-gray-400" />
            {readingTime}
          </span>
        </div>
      </div>

      {/* Content */}
      {topicDetail.content ? (
        <div
          className="bg-white rounded-2xl px-6 py-8 md:px-10 md:py-10"
          style={{ boxShadow: SHADOW }}
        >
          <ContentRenderer content={topicDetail.content} contentFormat={topicDetail.contentFormat} variant="block" />
        </div>
      ) : (
        <div
          className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3"
          style={{ boxShadow: SHADOW }}
        >
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
            <Icon icon="hugeicons:file-not-found" className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">No content available for this topic yet.</p>
        </div>
      )}
    </section>
  );
}
