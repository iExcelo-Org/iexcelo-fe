import {
  IExamStore,
  IExamSession,
  IExamQuestion,
  IExamPassage,
  IQuestionResponse,
  IFlagUpdate,
} from "@/types";
import type { ITopic } from "@/types";
import { create } from "zustand";
import { authRequest } from "@/lib/api";
import { handleAxiosError, EXAM_PAGE_SIZE } from "@/utils";

const PAGE_SIZE = EXAM_PAGE_SIZE;

/** Slice an array of questions into a page-keyed cache record. */
function seedCache(
  questions: IExamQuestion[],
): Record<number, IExamQuestion[]> {
  const cache: Record<number, IExamQuestion[]> = {};
  for (let i = 0; i < questions.length; i += PAGE_SIZE) {
    const page = Math.floor(i / PAGE_SIZE);
    cache[page] = questions.slice(i, i + PAGE_SIZE);
  }
  return cache;
}

export const useExamStore = create<IExamStore>()((set, get) => ({
  subjects: [],
  isLoadingSubjects: false,

  mockConfig: null,
  isLoadingMockConfig: false,

  pendingConfig: null,
  examSession: null,
  isStartingExam: false,

  examResult: null,
  isSubmittingExam: false,

  // ── Page cache ────────────────────────────────────────────────────────────
  questionCache: {},
  passageCache: {},
  loadingPages: new Set(),

  // ── Topics ────────────────────────────────────────────────────────────────
  topics: [],
  topicsGrouped: {},
  topicsHasMore: {},
  topicsPage: {},
  topicsTotals: {},
  isLoadingTopics: false,
  topicDetail: null,
  isLoadingTopicDetail: false,

  fetchSubjectsForExam: async (examTypeId) => {
    set({ isLoadingSubjects: true });
    try {
      const res = await authRequest({
        method: "GET",
        url: `/exams/types/${examTypeId}/subjects`,
      });
      set({ subjects: res.data.data ?? [] });
    } catch (e) {
      handleAxiosError(e, "Failed to load subjects");
    } finally {
      set({ isLoadingSubjects: false });
    }
  },

  fetchMockConfig: async (examTypeId) => {
    set({ isLoadingMockConfig: true });
    try {
      const res = await authRequest({
        method: "GET",
        url: `/exams/types/${examTypeId}/mock-config`,
      });
      set({ mockConfig: res.data.data ?? null });
    } catch (e) {
      handleAxiosError(e, "Failed to load mock config");
    } finally {
      set({ isLoadingMockConfig: false });
    }
  },

  setPendingConfig: (config) =>
    set({ pendingConfig: config, examSession: null, examResult: null }),

  startExam: async () => {
    const { pendingConfig } = get();
    if (!pendingConfig) return;

    set({ isStartingExam: true });
    try {
      const res = await authRequest({
        method: "POST",
        url: "/exams/start",
        data: {
          examTypeId: pendingConfig.examTypeId,
          selectedSubjectIds: pendingConfig.subjectIds,
          mode: pendingConfig.mode,
          ...(pendingConfig.questionCount !== undefined && {
            questionCount: pendingConfig.questionCount,
          }),
          ...(pendingConfig.timeLimitSeconds !== undefined && {
            timeLimitSeconds: pendingConfig.timeLimitSeconds,
          }),
          ...(pendingConfig.category !== undefined && {
            category: pendingConfig.category,
          }),
          ...(pendingConfig.questionFilter !== undefined && {
            questionFilter: pendingConfig.questionFilter,
          }),
          ...(pendingConfig.selectedTopicIds?.length && {
            selectedTopicIds: pendingConfig.selectedTopicIds,
          }),
        },
      });

      const data = res.data.data;
      const session: IExamSession = {
        ...data,
        examTypeName: pendingConfig.examTypeName,
        subjectNames: pendingConfig.subjectNames,
        flaggedQuestionIds: data.flaggedQuestionIds ?? [],
        category: pendingConfig.category ?? data.category,
      };

      // Seed the page cache with the first-page questions returned by startExam.
      // Backend returns up to 100 questions; we slice them into PAGE_SIZE chunks.
      const initialQuestions: IExamQuestion[] = data.questions ?? [];
      const initialPassages: IExamPassage[] = data.passages ?? [];

      const questionCache = seedCache(initialQuestions);

      const passageCache: Record<string, IExamPassage> = {};
      for (const p of initialPassages) {
        passageCache[p.id] = p;
      }

      set({
        examSession: session,
        pendingConfig: null,
        questionCache,
        passageCache,
      });
    } catch (e) {
      handleAxiosError(e, "Failed to start exam");
    } finally {
      set({ isStartingExam: false });
    }
  },

  fetchPage: async (page) => {
    const { examSession, questionCache, loadingPages } = get();
    if (!examSession) return;
    if (questionCache[page] !== undefined) return; // already cached
    if (loadingPages.has(page)) return; // already in-flight

    const newLoading = new Set(loadingPages);
    newLoading.add(page);
    set({ loadingPages: newLoading });

    try {
      const offset = page * PAGE_SIZE;
      const res = await authRequest({
        method: "GET",
        url: `/exams/attempts/${examSession.examAttemptId}/questions`,
        params: { offset, limit: PAGE_SIZE },
      });

      const fetched: IExamQuestion[] = res.data.data?.questions ?? [];
      const passages: IExamPassage[] = res.data.data?.passages ?? [];

      const updatedCache = { ...get().questionCache, [page]: fetched };
      const updatedPassageCache = { ...get().passageCache };
      for (const p of passages) {
        updatedPassageCache[p.id] = p;
      }

      set({ questionCache: updatedCache, passageCache: updatedPassageCache });
    } catch (e) {
      handleAxiosError(e, "Failed to load questions");
    } finally {
      const finished = new Set(get().loadingPages);
      finished.delete(page);
      set({ loadingPages: finished });
    }
  },

  prefetchAround: (questionIndex) => {
    const currentPage = Math.floor(questionIndex / PAGE_SIZE);
    // Fetch current page + 2 ahead + 1 behind (each checks cache/in-flight internally)
    const pagesToFetch = [
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
    for (const page of pagesToFetch) {
      if (page < 0) continue;
      get().fetchPage(page); // fire-and-forget
    }
  },

  getQuestion: (index) => {
    const page = Math.floor(index / PAGE_SIZE);
    const offset = index % PAGE_SIZE;
    return get().questionCache[page]?.[offset] ?? null;
  },

  getPassage: (passageId) => {
    return get().passageCache[passageId] ?? null;
  },

  submitExam: async (
    responses: IQuestionResponse[],
    totalTimeSpent: number,
    flagUpdates?: IFlagUpdate[],
  ) => {
    const { examSession } = get();
    if (!examSession) return;

    set({ isSubmittingExam: true });
    try {
      const res = await authRequest({
        method: "POST",
        url: "/exams/submit",
        data: {
          examAttemptId: examSession.examAttemptId,
          questionResponses: responses,
          totalTimeSpent,
          ...(flagUpdates?.length && { flagUpdates }),
        },
      });
      set({ examResult: res.data.data });
    } catch (e) {
      handleAxiosError(e, "Failed to submit exam");
    } finally {
      set({ isSubmittingExam: false });
    }
  },

  clearSession: () =>
    set({
      examSession: null,
      examResult: null,
      pendingConfig: null,
      questionCache: {},
      passageCache: {},
      loadingPages: new Set(),
    }),

  fetchTopicsByExamType: async (examTypeId, subjectIds?, limit = 20) => {
    set({ isLoadingTopics: true });
    try {
      const params: Record<string, string | number> = { limit };
      if (subjectIds?.length) params.subjectIds = subjectIds.join(",");
      const res: any = await authRequest({
        method: "GET",
        url: `/exams/types/${examTypeId}/topics`,
        params,
      });
      // Response shape: { subjectId, subjectName, topics, total, hasMore }[]
      const raw: {
        subjectId: string;
        subjectName: string;
        topics: ITopic[];
        total: number;
        hasMore: boolean;
      }[] = res.data.data ?? [];

      const grouped: Record<string, ITopic[]> = {};
      const hasMoreMap: Record<string, boolean> = {};
      const pageMap: Record<string, number> = {};
      const totalsMap: Record<string, number> = {};
      const list: ITopic[] = [];

      for (const item of raw) {
        const enriched = item.topics.map((t) => ({
          ...t,
          subjectName: item.subjectName,
        }));
        grouped[item.subjectId] = enriched;
        hasMoreMap[item.subjectId] = item.hasMore;
        pageMap[item.subjectId] = 1;
        totalsMap[item.subjectId] = item.total;
        list.push(...enriched);
      }

      set({
        topics: list,
        topicsGrouped: grouped,
        topicsHasMore: hasMoreMap,
        topicsPage: pageMap,
        topicsTotals: totalsMap,
      });
    } catch (e) {
      handleAxiosError(e, "Failed to load topics");
    } finally {
      set({ isLoadingTopics: false });
    }
  },

  fetchTopicsForSubject: async (subjectId, page?, limit?, examTypeId?) => {
    const isPaged = page !== undefined && limit !== undefined;
    try {
      const params: Record<string, string | number> = {};
      if (isPaged) { params.page = page!; params.limit = limit!; }
      if (examTypeId) params.examTypeId = examTypeId;
      const res: any = await authRequest({
        method: "GET",
        url: `/exams/subjects/${subjectId}/topics`,
        params: Object.keys(params).length ? params : undefined,
      });
      if (isPaged) {
        const { topics, total, hasMore } = res.data.data as {
          topics: ITopic[];
          total: number;
          hasMore: boolean;
        };
        set((s) => ({
          topicsGrouped:
            page === 1
              ? { ...s.topicsGrouped, [subjectId]: topics }
              : {
                  ...s.topicsGrouped,
                  [subjectId]: [
                    ...(s.topicsGrouped[subjectId] ?? []),
                    ...topics,
                  ],
                },
          topicsHasMore: { ...s.topicsHasMore, [subjectId]: hasMore },
          topicsPage: { ...s.topicsPage, [subjectId]: page! },
        }));
        void total;
        return topics;
      } else {
        const list: ITopic[] = res.data.data ?? [];
        set((s) => ({
          topicsGrouped: { ...s.topicsGrouped, [subjectId]: list },
        }));
        return list;
      }
    } catch (e) {
      handleAxiosError(e, "Failed to load topics");
      return [];
    }
  },

  searchTopics: async (examTypeId, q, page = 1, limit = 20) => {
    try {
      const res: any = await authRequest({
        method: "GET",
        url: `/exams/topics/search`,
        params: { examTypeId, q, page, limit },
      });
      const data = res.data.data ?? {};
      return {
        items: (data.items ?? []) as ITopic[],
        total: (data.total ?? 0) as number,
        hasMore: (data.hasMore ?? false) as boolean,
      };
    } catch (e) {
      handleAxiosError(e, "Failed to search topics");
      return { items: [], total: 0, hasMore: false };
    }
  },

  fetchTopicDetail: async (topicId) => {
    set({ isLoadingTopicDetail: true, topicDetail: null });
    try {
      const res: any = await authRequest({
        method: "GET",
        url: `/exams/topics/${topicId}`,
      });
      set({ topicDetail: res.data.data ?? null });
    } catch (e) {
      handleAxiosError(e, "Failed to load topic");
    } finally {
      set({ isLoadingTopicDetail: false });
    }
  },

  fetchTopicDetailRaw: async (topicId) => {
    try {
      const res: any = await authRequest({
        method: "GET",
        url: `/exams/topics/${topicId}`,
      });
      return (res.data.data ?? null) as ITopic | null;
    } catch (e) {
      handleAxiosError(e, "Failed to load topic");
      return null;
    }
  },
}));
