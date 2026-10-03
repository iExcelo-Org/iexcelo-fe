"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/atoms";
import { InputField } from "@/components/molecules";
import { useStudentStore, useExamStore } from "@/store";
import { useAuthStore } from "@/store";
import { stripMarkdownPreview } from "@/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ITopic } from "@/types";

const TOPICS_PAGE_LIMIT = 20;

// Sentinel fires onVisible once when it enters the viewport.
function TopicSentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          onVisible();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisible]);

  return <div ref={ref} className="h-2" />;
}

function PageSkeleton() {
  const widths = [140, 100, 160, 120];
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)" }}
          className="bg-white rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 md:p-5">
            <div>
              <div className="h-4 bg-gray-200 rounded mb-1.5" style={{ width: widths[i] }} />
              <div className="h-3 bg-gray-100 rounded w-16" />
            </div>
            <div className="h-5 w-5 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg"
      ? "w-9 h-9 border-[3px]"
      : size === "sm"
        ? "w-5 h-5 border-2"
        : "w-7 h-7 border-[3px]";
  return (
    <div
      className={`${cls} rounded-full border-[#007FFF] border-t-transparent animate-spin`}
    />
  );
}

export default function Topics() {
  const { accessToken } = useAuthStore();
  const { dashboardData } = useStudentStore();
  const {
    topicsGrouped,
    topicsHasMore,
    topicsPage,
    topicsTotals,
    isLoadingTopics,
    fetchTopicsByExamType,
    fetchTopicsForSubject,
    searchTopics,
  } = useExamStore();

  const examTypeId = dashboardData?.currentExamType?.id ?? "";
  const subjects = dashboardData?.selectedSubjects ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ITopic[] | null>(null);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMoreSearch, setIsLoadingMoreSearch] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(),
  );
  const [loadingFallbackSubject, setLoadingFallbackSubject] = useState<
    string | null
  >(null);
  const [loadingMoreSubject, setLoadingMoreSubject] = useState<string | null>(
    null,
  );

  // Initial load — fetch first 20 topics per subject + totals for all subjects
  useEffect(() => {
    if (!accessToken || !examTypeId) return;
    const subjectIds = subjects.map((s) => s.id);
    fetchTopicsByExamType(
      examTypeId,
      subjectIds.length > 0 ? subjectIds : undefined,
      TOPICS_PAGE_LIMIT,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, examTypeId]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !examTypeId) return;
    setIsSearching(true);
    const { items, total, hasMore } = await searchTopics(examTypeId, searchQuery.trim(), 1);
    setSearchResults(items);
    setSearchTotal(total);
    setSearchPage(1);
    setSearchHasMore(hasMore);
    setIsSearching(false);
  };

  const handleLoadMoreSearch = async () => {
    if (isLoadingMoreSearch || !searchHasMore || !examTypeId) return;
    setIsLoadingMoreSearch(true);
    const nextPage = searchPage + 1;
    const { items, hasMore } = await searchTopics(examTypeId, searchQuery.trim(), nextPage);
    setSearchResults((prev) => [...(prev ?? []), ...items]);
    setSearchPage(nextPage);
    setSearchHasMore(hasMore);
    setIsLoadingMoreSearch(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    setSearchTotal(0);
    setSearchPage(1);
    setSearchHasMore(false);
  };

  const toggleSubject = async (subjectId: string) => {
    const next = new Set(expandedSubjects);
    if (next.has(subjectId)) {
      next.delete(subjectId);
      setExpandedSubjects(next);
      return;
    }
    next.add(subjectId);
    setExpandedSubjects(next);

    // Fallback: if initial load missed this subject, fetch it now
    if (!topicsGrouped[subjectId]) {
      setLoadingFallbackSubject(subjectId);
      await fetchTopicsForSubject(subjectId, 1, TOPICS_PAGE_LIMIT);
      setLoadingFallbackSubject(null);
    }
  };

  const handleLoadMore = async (subjectId: string) => {
    if (loadingMoreSubject) return;
    const nextPage = (topicsPage[subjectId] ?? 1) + 1;
    setLoadingMoreSubject(subjectId);
    await fetchTopicsForSubject(subjectId, nextPage, TOPICS_PAGE_LIMIT);
    setLoadingMoreSubject(null);
  };

  const renderTopicCard = (topic: ITopic) => (
    <div
      key={topic.id}
      style={{
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)",
      }}
      className="bg-white rounded-xl p-3 sm:p-4"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[.9375rem] sm:text-base text-gray-900 mb-1 leading-snug">{topic.name}</h4>
          {topic.subjectName && (
            <p className="text-[.6875rem] sm:text-xs text-gray-400 mb-1.5 sm:mb-2">{topic.subjectName}</p>
          )}
          {topic.content && (
            <p className="text-[.8125rem] sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 break-words">
              {stripMarkdownPreview(topic.content, 200, true)}
            </p>
          )}
        </div>
        <Link
          href={`/student/topics/${topic.id}`}
          className="shrink-0 flex items-center gap-1 text-[#007FFF] text-xs sm:text-sm font-semibold hover:underline mt-0.5"
        >
          Read
          <Icon icon="hugeicons:arrow-right-01" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <section className="px-[.875rem] sm:px-[1.25rem] xl:px-[2rem] py-[1.25rem] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-lg md:text-xl font-bold text-gray-900">Topics</h1>
        <span className="bg-[#F3F3F3] w-fit text-[#A12161] text-xs font-semibold px-3 py-2 rounded-full">
          {dashboardData?.currentExamType?.name ?? ""}
        </span>
      </div>

      {/* Search */}
      <div className="flex items-stretch gap-2 mb-8 lg:max-w-[60%]">
        <div className="flex-1">
          <InputField
            type="text"
            label={null}
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              setSearchQuery(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent) =>
              e.key === "Enter" && handleSearch()
            }
            className="h-12 w-full border rounded-full border-[#A6A6A6] text-[#A6A6A6] px-4"
          />
        </div>
        {searchResults !== null ? (
          <Button
            variant="outlined"
            onClick={handleClearSearch}
            className="shrink-0 justify-center h-12"
          >
            Clear
          </Button>
        ) : (
          <Button
            onClick={handleSearch}
            loading={isSearching}
            className="shrink-0 justify-center h-12"
          >
            <Icon icon="hugeicons:search-01" className={cn("w-5 h-5", isSearching && "hidden sm:block")} />
            <span className="hidden sm:inline">Search</span>
          </Button>
        )}
      </div>

      {/* Search results */}
      {searchResults !== null ? (
        <div>
          <p className="text-[.8125rem] sm:text-sm text-gray-500 mb-3 sm:mb-4">
            {searchTotal} result{searchTotal !== 1 ? "s" : ""}{" "}
            for &quot;{searchQuery}&quot;
          </p>
          {searchResults.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No topics found.</p>
          ) : (
            <div className="space-y-3">
              {searchResults.map(renderTopicCard)}
              {searchHasMore && !isLoadingMoreSearch && (
                <TopicSentinel
                  key={`search-sentinel-p${searchPage}`}
                  onVisible={handleLoadMoreSearch}
                />
              )}
              {isLoadingMoreSearch && (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}
            </div>
          )}
        </div>
      ) : isLoadingTopics ? (
        <PageSkeleton />
      ) : subjects.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          No subjects selected. Please select your subjects first.
        </p>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => {
            const topics = topicsGrouped[subject.id] ?? [];
            const isExpanded = expandedSubjects.has(subject.id);
            const isFallbackLoading = loadingFallbackSubject === subject.id;
            const isLoadingMore = loadingMoreSubject === subject.id;
            const hasMore = topicsHasMore[subject.id] ?? false;
            const total = topicsTotals[subject.id] ?? topics.length;

            return (
              <div
                key={subject.id}
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)",
                }}
                className="bg-white rounded-xl overflow-hidden"
              >
                {/* Subject header */}
                <button
                  onClick={() => toggleSubject(subject.id)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {total} topic{total !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Icon
                    icon="hugeicons:arrow-down-01"
                    className={cn(
                      "w-5 h-5 text-gray-400 transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>

                {/* Topics list */}
                {isExpanded && (
                  <div className="border-t border-[#EDEDED] px-4 md:px-5 py-4 space-y-3">
                    {isFallbackLoading ? (
                      <div className="flex justify-center py-6">
                        <Spinner size="lg" />
                      </div>
                    ) : topics.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No topics available for this subject.
                      </p>
                    ) : (
                      <>
                        {topics.map((topic) => (
                          <div
                            key={topic.id}
                            className="flex items-center justify-between gap-3 py-2 border-b border-[#F3F3F3] last:border-0"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {topic.name}
                              </p>
                              {topic.content && (
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                  {stripMarkdownPreview(
                                    topic.content,
                                    80,
                                    true,
                                  )}
                                </p>
                              )}
                            </div>
                            <Link
                              href={`/student/topics/${topic.id}`}
                              className="shrink-0 flex items-center gap-1 text-[#007FFF] text-xs font-semibold hover:underline"
                            >
                              Read
                              <Icon
                                icon="hugeicons:arrow-right-01"
                                className="w-3.5 h-3.5"
                              />
                            </Link>
                          </div>
                        ))}

                        {/* Infinite scroll sentinel — only when more pages exist */}
                        {hasMore && !isLoadingMore && (
                          <TopicSentinel
                            key={`sentinel-${subject.id}-p${topicsPage[subject.id]}`}
                            onVisible={() => handleLoadMore(subject.id)}
                          />
                        )}

                        {isLoadingMore && (
                          <div className="flex justify-center py-3">
                            <Spinner />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
