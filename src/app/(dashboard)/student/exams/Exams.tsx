"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { ExamModeModal } from "@/components/molecules/student-dashboard";
import { Button, CheckBox, Radio } from "@/components/atoms";
import { InputField } from "@/components/molecules";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { capitalize } from "@/utils";
import Link from "next/link";
import { useStudentStore, useExamStore } from "@/store";

// ── Skeletons ─────────────────────────────────────────────────────────────

function SubjectListSkeleton() {
  return (
    <div className="flex flex-col gap-[1rem] md:gap-[1.5rem] xl:gap-[2rem] animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-1.5">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

function ExamsPageSkeleton() {
  return (
    <section className="px-[.875rem] sm:px-[1.25rem] xl:px-[2rem] py-[1.25rem] mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="h-7 bg-gray-200 rounded w-40" />
        <div className="h-6 bg-gray-200 rounded w-32" />
      </div>
      <div
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="bg-white p-[1rem] md:p-[1.375rem] rounded-[1rem] space-y-6"
      >
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 w-full sm:w-[17.75rem] bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-[1px] bg-[#EDEDED] w-full" />
        <div
          className="[box-shadow:0_0_0_1px_#DCDFE4] p-[1rem] md:p-[1.375rem] rounded-[1rem] max-sm:[box-shadow:none] max-sm:p-0 max-sm:rounded-none"
        >
          <div className="flex gap-2 mb-6 sm:mb-10 lg:max-w-[60%]">
            <div className="flex-1 h-12 bg-gray-100 rounded-full" />
            <div className="h-12 w-24 bg-gray-200 rounded-lg" />
          </div>
          <SubjectListSkeleton />
        </div>
      </div>
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function Exams() {
  const router = useRouter();
  const { dashboardData, isLoadingDashboard, switchExamType } =
    useStudentStore();
  const {
    mockConfig,
    isLoadingMockConfig,
    fetchMockConfig,
    setPendingConfig,
    fetchTopicsForSubject,
    topicsGrouped,
    topicsHasMore,
    topicsPage,
  } = useExamStore();

  const examTypeId = dashboardData?.currentExamType?.id ?? "";
  const examTypeName = dashboardData?.currentExamType?.name ?? "";
  const isDemoUser = !dashboardData?.currentExamType?.isPaid;
  const isSponsored = dashboardData?.student?.isSponsored ?? false;
  const freeTierLimit =
    dashboardData?.currentExamType?.freeTierQuestionLimit ?? 50;
  const supportedCategories = dashboardData?.currentExamType
    ?.supportedCategories ?? ["objectives"];
  const hasMultipleCategories = supportedCategories.length > 1;

  // Student's already-registered subjects for this exam type
  const registeredSubjects = dashboardData?.selectedSubjects ?? [];

  const [selectedMode, setSelectedMode] = useState("revision");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    supportedCategories[0] ?? "objectives",
  );
  const [questionFilter, setQuestionFilter] = useState<
    "mixed" | "fresh" | "flagged" | "weak"
  >("mixed");
  const [searchQuery, setSearchQuery] = useState("");
  const [showExamModal, setShowExamModal] = useState(false);
  const [showExamTypeDropdown, setShowExamTypeDropdown] = useState(false);
  const [expandedSubjectTopics, setExpandedSubjectTopics] = useState<
    string | null
  >(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [loadingTopicsForSubject, setLoadingTopicsForSubject] = useState<
    string | null
  >(null);
  const [loadingMoreTopics, setLoadingMoreTopics] = useState<string | null>(null);
  const TOPICS_LIMIT = 20;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subjects visible under the current category filter
  // Practical category: only show subjects that actually have practical questions
  const visibleSubjects =
    selectedCategory === "practical"
      ? registeredSubjects.filter((s) => (s.practicalCount ?? 0) > 0)
      : registeredSubjects;

  // Fetch mock config whenever exam type changes
  useEffect(() => {
    if (!examTypeId) return;
    fetchMockConfig(examTypeId);
  }, [examTypeId, fetchMockConfig]);

  // Reset selections when exam type switches — supportedCategories derives from examTypeId
  useEffect(() => {
    setSelectedSubjectIds([]);
    setSelectedTopicIds([]);
    setExpandedSubjectTopics(null);
    setSelectedCategory(supportedCategories[0] ?? "objectives");
  }, [examTypeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowExamTypeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Full-page skeleton on initial load
  if (isLoadingDashboard && !dashboardData) {
    return <ExamsPageSkeleton />;
  }

  const filteredSubjects = searchQuery
    ? visibleSubjects.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : visibleSubjects;

  const allSelected =
    visibleSubjects.length > 0 &&
    visibleSubjects.every((s) => selectedSubjectIds.includes(s.id));

  // Total Qs for the "All" pill — sum of visible subjects' Q counts
  const visibleQTotal = visibleSubjects.reduce(
    (sum, s) => sum + (s.totalQuestions ?? 0),
    0,
  );
  const visibleQAttempted = visibleSubjects.reduce(
    (sum, s) => sum + (s.questionsAttempted ?? 0),
    0,
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectedSubjectIds(checked ? visibleSubjects.map((s) => s.id) : []);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubjectIds([]);
    setSelectedTopicIds([]);
    setExpandedSubjectTopics(null);
  };

  const handleSubjectToggle = (subjectId: string, checked: boolean) => {
    if (subjectId === "all") {
      handleSelectAll(!allSelected);
      return;
    }
    if (checked) {
      // Deselecting — also clear any topics from this subject
      const subjectTopicIds = (topicsGrouped[subjectId] ?? []).map((t) => t.id);
      setSelectedTopicIds((prev) =>
        prev.filter((id) => !subjectTopicIds.includes(id)),
      );
      setSelectedSubjectIds(
        selectedSubjectIds.filter((id) => id !== subjectId),
      );
      if (expandedSubjectTopics === subjectId) setExpandedSubjectTopics(null);
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, subjectId]);
    }
  };

  const handleViewTopics = async (subjectId: string) => {
    if (expandedSubjectTopics === subjectId) {
      setExpandedSubjectTopics(null);
      return;
    }
    setExpandedSubjectTopics(subjectId);
    if (!topicsGrouped[subjectId]) {
      setLoadingTopicsForSubject(subjectId);
      await fetchTopicsForSubject(subjectId, 1, TOPICS_LIMIT, examTypeId);
      setLoadingTopicsForSubject(null);
    }
  };

  const handleLoadMoreTopics = async (subjectId: string) => {
    const nextPage = (topicsPage[subjectId] ?? 1) + 1;
    setLoadingMoreTopics(subjectId);
    await fetchTopicsForSubject(subjectId, nextPage, TOPICS_LIMIT, examTypeId);
    setLoadingMoreTopics(null);
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  };

  const handleStartExam = () => {
    if (selectedSubjectIds.length === 0) return;
    setShowExamModal(true);
  };

  const buildPendingConfig = (subjectIds: string[]) => ({
    examTypeId,
    examTypeName,
    subjectIds,
    subjectNames: registeredSubjects
      .filter((s) => subjectIds.includes(s.id))
      .map((s) => s.name),
    ...(hasMultipleCategories && { category: selectedCategory }),
    ...(!isDemoUser && { questionFilter }),
    ...(selectedTopicIds.length > 0 && { selectedTopicIds }),
  });

  const handleExamModalContinue = (numQuestions?: number, time?: number) => {
    setShowExamModal(false);
    if (selectedMode === "revision" && numQuestions) {
      setPendingConfig({
        ...buildPendingConfig(selectedSubjectIds),
        mode: "revision",
        questionCount: numQuestions,
      });
      router.push("/student/exams/revision");
    } else if (selectedMode === "timed" && numQuestions && time) {
      setPendingConfig({
        ...buildPendingConfig(selectedSubjectIds),
        mode: "timed",
        questionCount: numQuestions,
        timeLimitSeconds: time * 60,
      });
      router.push("/student/exams/timed");
    } else if (selectedMode === "mock") {
      setPendingConfig({
        ...buildPendingConfig(selectedSubjectIds),
        mode: "mock",
      });
      router.push("/student/exams/mock");
    }
  };

  const mockDuration = mockConfig
    ? `${Math.floor(mockConfig.standardDurationMinutes / 60)} hr${mockConfig.standardDurationMinutes % 60 ? ` ${mockConfig.standardDurationMinutes % 60} mins` : ""}`
    : "...";

  // Dropdown: only exam types the student has access to (paid or demo)
  const switchableExamTypes = dashboardData?.allowedExamTypes ?? [];

  return (
    <>
      <section className="px-[.875rem] sm:px-[1.25rem] xl:px-[2rem] py-[1.25rem] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() =>
                  switchableExamTypes.length > 1 &&
                  setShowExamTypeDropdown(!showExamTypeDropdown)
                }
                className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-900"
              >
                {examTypeName || "Select Exam"}
                {switchableExamTypes.length > 1 && (
                  <Icon icon="hugeicons:arrow-down-01" className="w-5 h-5" />
                )}
              </button>
              {showExamTypeDropdown && switchableExamTypes.length > 1 && (
                <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 w-56 z-20">
                  {switchableExamTypes.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        switchExamType(exam.id);
                        setShowExamTypeDropdown(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm hover:bg-gray-50",
                        exam.id === examTypeId
                          ? "font-semibold text-[#007FFF]"
                          : "text-gray-700",
                      )}
                    >
                      {exam.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500 mr-2">
              Current Exam Subscription:
            </span>
            <span className="bg-[#F3F3F3] w-fit text-[#A12161] text-xs font-semibold px-3 py-2 rounded-full">
              {examTypeName || "None"}
            </span>
          </div>
        </div>

        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="bg-white p-[1rem] md:p-[1.375rem] rounded-[1rem]"
        >
          {isDemoUser && (
            <div className="p-4 border border-[#FFD6A7] bg-[#FEF6E7] rounded-xl sm:rounded-[9999999px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-2 text-[#865503]">
                <Icon
                  className="w-4 h-4 text-current"
                  icon={"hugeicons:square-lock-01"}
                />
                <span className="font-[400] text-[.875rem] leading-5">
                  {isSponsored
                    ? `You're on a sponsored demo. Your sponsor can unlock the full question bank for you.`
                    : `Subscribe to unlock all questions for this exam. Try our demo with ${freeTierLimit} sample questions first!`}
                </span>
              </div>
              {!isSponsored && (
                <Link href={`/student/upgrade?examTypeId=${examTypeId}`} className="w-full sm:w-auto">
                  <Button className="text-[.875rem] w-full sm:w-auto justify-center">
                    <Icon className="w-5 h-5" icon={"hugeicons:sparkles"} />
                    Subscribe Now
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Category filter — only when exam type supports more than one category */}
          {hasMultipleCategories && (
            <div className="flex flex-col sm:flex-row mb-8 gap-3 sm:gap-6">
              {supportedCategories.map((cat) => (
                <div
                  key={cat}
                  className="sm:flex-1 cursor-pointer"
                  onClick={() => handleCategoryChange(cat)}
                >
                  <Radio
                    name="question-category"
                    value={selectedCategory === cat}
                    onChange={() => handleCategoryChange(cat)}
                    customLabel={
                      <span className="ml-2 sm:ml-3 block font-[500] text-[.875rem] sm:text-[1rem]">
                        {capitalize(cat)}
                      </span>
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <h2 className="font-semibold text-gray-900 text-[1.25rem] leading-[1.75rem] tracking-[-.4px] mb-6">
            Select Exam Mode
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            {[
              {
                id: "revision",
                title: "Revision Mode",
                isPremium: false,
                description:
                  "Practice freely, see answers instantly. No timer, just learning.",
              },
              {
                id: "timed",
                title: "Timed Mode",
                isPremium: false,
                description:
                  "Choose your preferred number of questions and set your own time.",
              },
              {
                id: "mock",
                title: "Mock Mode",
                isPremium: true,
                description:
                  "Real exam environment with exact question counts and strict timing.",
              },
            ].map((mode, index) => {
              const selected = selectedMode === mode.id;
              const isLocked = mode.isPremium && isDemoUser;
              return (
                <button
                  style={{ boxShadow: "0 0 0 1px #DCDFE4" }}
                  key={`__exam__mode__${index}`}
                  disabled={isLocked}
                  onClick={() => !isLocked && setSelectedMode(mode.id)}
                  className={cn(
                    "flex items-start w-full sm:w-[17.75rem] gap-3 py-3 relative px-2.75 rounded-xl text-left transition-all",
                  )}
                >
                  <div className="pt-[.375rem]">
                    <Radio
                      name="exam-mode"
                      value={selected}
                      onChange={() => !isLocked && setSelectedMode(mode.id)}
                    />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "font-[500] leading-[1.5rem] text-[1rem]",
                        selected ? "text-[#007FFF]" : "text-[#2B2B2B]",
                      )}
                    >
                      {mode.title}
                    </h3>
                    <p className="text-[.875rem] leading-[1.25rem] text-[#757575]">
                      {mode.description}
                    </p>
                  </div>

                  {isLocked && (
                    <>
                      <span className="absolute bg-[#EDEDED] w-full h-full opacity-[.4] top-0 left-0" />
                      <span className="absolute w-full h-full top-0 left-0 p-2">
                        <span className="bg-[#D42620] flex items-center p-[.125rem_.375rem] text-white rounded-[999999px] text-[.75rem] gap-1 w-fit ml-auto">
                          <Icon
                            className="w-3 h-3 text-current"
                            icon={"hugeicons:square-lock-01"}
                          />
                          locked
                        </span>
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
          <div className="my-[2rem] h-[1px] bg-[#EDEDED] w-full" />
          <div
            className="[box-shadow:0_0_0_1px_#DCDFE4] p-[1rem] md:p-[1.375rem] rounded-[1rem] max-sm:[box-shadow:none] max-sm:p-0 max-sm:rounded-none"
          >
            <div className="flex items-stretch gap-2 mb-6 sm:mb-10 lg:max-w-[60%]">
              <div className="flex-1">
                <InputField
                  type="text"
                  label={null}
                  placeholder="Search subject..."
                  value={searchQuery}
                  onChange={(
                    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                  ) => setSearchQuery(e.target.value)}
                  className="h-12 w-full border rounded-full border-[#A6A6A6] text-[#A6A6A6] px-4"
                />
              </div>
              <Button className="shrink-0 justify-center h-12">
                <Icon icon="hugeicons:search-01" className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>

            {/* Question filter — premium users only, not applicable to mock mode */}
            {!isDemoUser && selectedMode !== "mock" && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Question Filter
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      {
                        value: "mixed",
                        label: "Mixed",
                        description: "Mostly unseen + a few weak ones",
                        icon: "hugeicons:shuffle",
                      },
                      {
                        value: "fresh",
                        label: "Fresh Only",
                        description: "Questions you haven't seen before",
                        icon: "hugeicons:sparkles",
                      },
                      {
                        value: "flagged",
                        label: "Flagged",
                        description: "Questions you flagged for review",
                        icon: "hugeicons:flag-02",
                      },
                      {
                        value: "weak",
                        label: "Weak Areas",
                        description: "Questions you got wrong most",
                        icon: "hugeicons:target-02",
                      },
                    ] as const
                  ).map((opt) => {
                    const active = questionFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQuestionFilter(opt.value)}
                        title={opt.description}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                          active
                            ? "bg-[#007FFF] text-white border-[#007FFF]"
                            : "bg-white text-gray-600 border-gray-300 hover:border-[#007FFF] hover:text-[#007FFF]",
                        )}
                      >
                        <Icon icon={opt.icon} className="w-4 h-4" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subject list — student's registered subjects only */}
            <div className="flex flex-col gap-[1rem] md:gap-[1.5rem] xl:gap-[2rem]">
              {isLoadingDashboard ? (
                <SubjectListSkeleton />
              ) : registeredSubjects.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No subjects selected yet. Please select your subjects first.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between py-1.5">
                    <CheckBox
                      onChange={() => handleSubjectToggle("all", allSelected)}
                      value={allSelected}
                      customLabel={
                        <span className="text-[.875rem] md:text-[1rem] font-[400] text-[#2B2B2B] ml-3">
                          All
                        </span>
                      }
                    />
                    <span className="text-xs text-[#667085]">
                      {visibleQAttempted.toLocaleString()}/{visibleQTotal.toLocaleString()} Qs
                    </span>
                  </div>

                  {filteredSubjects.map((subject) => {
                    const checked = selectedSubjectIds.includes(subject.id);
                    const isExpanded = expandedSubjectTopics === subject.id;
                    const subjectTopics = topicsGrouped[subject.id] ?? [];
                    const isLoadingTopics =
                      loadingTopicsForSubject === subject.id;
                    return (
                      <div key={subject.id}>
                        <div className="flex items-center justify-between py-1.5">
                          <CheckBox
                            onChange={() =>
                              handleSubjectToggle(subject.id, checked)
                            }
                            value={checked}
                            customLabel={
                              <span className="text-[.875rem] md:text-[1rem] font-[400] text-[#2B2B2B] ml-3">
                                {subject.name}
                              </span>
                            }
                          />
                          {isDemoUser ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#865503] bg-[#FEF6E7] px-2 py-0.5 rounded-full font-[500]">
                                {subject.questionsAttempted ?? 0}/{freeTierLimit}
                              </span>
                              <span className="text-xs text-[#667085]">
                                {(subject.totalQuestions ?? 0).toLocaleString()} Qs
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#667085]">
                                {(subject.questionsAttempted ?? 0).toLocaleString()}/{(subject.totalQuestions ?? 0).toLocaleString()} Qs
                              </span>
                              <button
                                onClick={() => handleViewTopics(subject.id)}
                                className={cn(
                                  "flex items-center gap-1 text-xs font-[600] transition-colors",
                                  checked
                                    ? "text-pink-500 hover:text-pink-600"
                                    : "text-gray-400",
                                )}
                                disabled={!checked}
                              >
                                {isExpanded ? "Hide Topics" : "View Topics"}
                                <Icon
                                  icon={
                                    isExpanded
                                      ? "hugeicons:arrow-up-01"
                                      : "hugeicons:arrow-down-01"
                                  }
                                  className="w-3 h-3"
                                />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Topic accordion — paid users only */}
                        {!isDemoUser && isExpanded && (
                          <div className="ml-4 max-[360px]:ml-2 sm:ml-7 mt-2 mb-3 border-l-2 border-[#E5E7EB] pl-4 space-y-2">
                            {isLoadingTopics ? (
                              <div className="flex flex-col gap-2 animate-pulse">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="h-3 bg-gray-200 rounded w-48"
                                  />
                                ))}
                              </div>
                            ) : subjectTopics.length === 0 ? (
                              <p className="text-xs text-gray-400">
                                No topics available for this subject.
                              </p>
                            ) : (
                              <>
                                {subjectTopics.map((topic) => {
                                  const topicChecked = selectedTopicIds.includes(topic.id);
                                  return (
                                    <div key={topic.id} className="flex items-center justify-between">
                                      <CheckBox
                                        onChange={() => handleTopicToggle(topic.id)}
                                        value={topicChecked}
                                        customLabel={
                                          <span className="text-sm text-[#2B2B2B] ml-2">
                                            {topic.name}
                                          </span>
                                        }
                                      />
                                    </div>
                                  );
                                })}
                                {topicsHasMore[subject.id] && (
                                  <button
                                    onClick={() => handleLoadMoreTopics(subject.id)}
                                    disabled={loadingMoreTopics === subject.id}
                                    className="mt-1 text-xs text-pink-500 font-[600] hover:underline disabled:opacity-50 flex items-center gap-1"
                                  >
                                    {loadingMoreTopics === subject.id ? (
                                      <span className="animate-pulse">Loading…</span>
                                    ) : (
                                      <>
                                        <Icon icon="hugeicons:add-01" className="w-3 h-3" />
                                        Load more topics
                                      </>
                                    )}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="flex justify-center md:mt-10 mt-6">
              <Button
                onClick={handleStartExam}
                disabled={selectedSubjectIds.length === 0 || isLoadingDashboard}
                className="w-full justify-center max-w-xs"
              >
                Start Exam
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ExamModeModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        mode={selectedMode as "revision" | "timed" | "mock"}
        examTypeName={examTypeName}
        subjects={registeredSubjects
          .filter((s) => selectedSubjectIds.includes(s.id))
          .map((s) => s.name)}
        isDemoUser={isDemoUser}
        freeTierLimit={freeTierLimit}
        onContinue={handleExamModalContinue}
        mockConfig={mockConfig}
        isLoadingMockConfig={isLoadingMockConfig}
        mockDuration={mockDuration}
      />
    </>
  );
}
