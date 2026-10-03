import type {
  UserType,
  UserTypeOrNull,
  RegistrationFormDataTypes,
} from "./auth";
import type { ICountry, IExamType, ISubject, ITopic } from "./utils";

// Authentication store types
export interface IAuthStore {
  hydrated: boolean;
  user: any | null;
  accessToken: null | string;
  refreshToken: null | string;
  tempToken: null | string;
  isAuthenticated: boolean;
  userType: UserTypeOrNull;
  signupEmail: null | string; // Store email during signup for verification

  setHydrated: () => void;
  setUserType: (type: UserTypeOrNull) => void;
  setTempToken: (token: string | null) => void;
  setSignupEmail: (email: string | null) => void;
  initGoogle: () => void;
  login: (
    data: { email: string; password: string },
    callback?: (status: boolean, role: UserType | null) => void,
  ) => Promise<void>;
  signup: (
    data: RegistrationFormDataTypes & { userType: UserType },
    callback?: () => void,
  ) => Promise<void>;
  exchangeToken: (
    token: string,
    callback?: (role: UserType) => void,
  ) => Promise<void>;
  completeOnboarding: (
    payload: any,
    callback?: (role: UserType) => void,
  ) => Promise<void>;
  verifyEmail: (
    data: { email: string; code: string },
    callback?: () => void,
  ) => Promise<void>;
  resendVerificationCode: (
    email: string,
    callback?: () => void,
  ) => Promise<void>;
  refreshTokens: () => Promise<{
    accessToken: string;
    refreshToken: string;
  } | null>;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  requestPasswordReset: (email: string, callback?: () => void) => Promise<void>;
  resetPassword: (
    token: string,
    newPassword: string,
    callback?: () => void,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  setUser: (user: any) => void;
  refreshUser: () => Promise<void>;
}

// Settings store types
export interface IBillingTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  subscriptionId: string | null;
  // Card info from the linked subscription (null for sponsored)
  isSponsored: boolean;
  cardBrand: string | null;
  cardLast4: string | null;
  cardExpMonth: string | null;
  cardExpYear: string | null;
  cardBank: string | null;
  cardChannel: string | null;
}

export interface ISettingsStore {
  // profile
  updatingProfile: boolean;
  updateProfile: (
    data: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      countryCode?: string;
      picture?: string;
    },
    onSuccess?: () => void,
  ) => Promise<void>;
  // password
  changingPassword: boolean;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    onSuccess?: () => void,
  ) => Promise<void>;
  // delete account
  deletingAccount: boolean;
  deleteAccount: (onSuccess?: () => void) => Promise<void>;
  // notifications
  updatingNotifPrefs: boolean;
  updateNotificationPreferences: (
    data: { newsletterOptIn?: boolean; promotionsOptIn?: boolean },
  ) => Promise<void>;
  // set password (Google-only)
  requestingSetPassword: boolean;
  requestSetPassword: () => Promise<boolean | 'rate-limited'>;
  confirmingSetPassword: boolean;
  confirmSetPassword: (
    code: string,
    newPassword: string,
    onSuccess?: () => void,
  ) => Promise<boolean>;
  // google
  disconnectingGoogle: boolean;
  disconnectGoogle: (onSuccess?: () => void) => Promise<void>;
  // billing
  billingHistory: IBillingTransaction[];
  billingTotal: number;
  billingPage: number;
  loadingBilling: boolean;
  fetchBillingHistory: (page?: number) => Promise<void>;
  // card info (per exam type)
  cardInfo: ICardInfo | null;
  loadingCardInfo: boolean;
  fetchCardInfo: (examTypeId: string) => Promise<void>;
}

// Utils store types
export interface IUtilsStore {
  countries: ICountry[];
  examTypes: IExamType[];
  subjects: ISubject[];
  setCountries: (countries: ICountry[]) => void;
  setExamTypes: (examTypes: IExamType[]) => void;
  setSubjects: (subjects: ISubject[]) => void;
  fetchSubjectsByExamType: (examTypeId: string) => Promise<ISubject[]>;
  getCountryByIsoCode: (isoCode: string) => ICountry | undefined;
  getExamTypeById: (id: string) => IExamType | undefined;
  getSubjectsByExamType: (examTypeId: string) => ISubject[];
  isUploadingImage: boolean;
  uploadImage: (file: File, folder: string) => Promise<string | null>;

  // PWA push subscriptions
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
}

// Checkout store types
export type VerificationState = "idle" | "loading" | "success" | "error";

export interface ICheckoutStore {
  userId: string | null;
  userType: UserTypeOrNull;
  planId: string | null;
  examTypeId: string | null;
  studentId: string | null; // For sponsors sponsoring a specific student

  verificationState: VerificationState;

  setCheckoutData: (
    data: Partial<
      Omit<
        ICheckoutStore,
        "setCheckoutData" | "clearCheckout" | "verifyPayment"
      >
    >,
  ) => void;
  clearCheckout: () => void;
  verifyPayment: (params: {
    sessionId?: string;
    reference?: string;
  }) => Promise<void>;
}

// Profile data interfaces
export interface IStudentProfile {
  id: string;
  defaultExamTypeId: string | null;
  lastExamTypeId: string | null;
  totalQuestionsSolved: number;
  totalCorrect: number;
  totalWrong: number;
  overallAccuracy: number;
  hasEverSubscribed?: boolean;
  isSponsored?: boolean;
  sponsorDisplayName?: string | null;
}

export interface IStudentExamType {
  id: string;
  name: string;
  isPaid: boolean;
  isDemoAllowed: boolean;
}

export interface IExamAvailable {
  id: string;
  name: string;
  description: string | null;
  isSubscribed: boolean;
  isPaid: boolean;
  isDemoAllowed: boolean;
  isDefault: boolean;
  isCurrent: boolean;
}

export interface ISubjectScores {
  data: Record<string, string | number>[];
  subjects: { id: string; name: string }[];
  granularity: "day" | "week" | "month";
}

export interface IDashboardData {
  meta: {
    userJoinedAt: string;
    dataAvailableSince: string;
    allowedDateRange: { min: string; max: string };
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    defaultExamTypeId: string | null;
    lastExamTypeId: string | null;
    hasEverSubscribed: boolean;
    isSponsored?: boolean;
    sponsorDisplayName?: string | null;
  };
  currentExamType: {
    id: string | null;
    name: string | null;
    isPaid: boolean;
    isDemoAllowed: boolean;
    hasSelectedSubjects: boolean;
    minSubjectsSelectable: number;
    maxSubjectsSelectable: number;
    freeTierQuestionLimit: number;
    supportedCategories: string[];
  };
  selectedSubjects: { id: string; name: string; totalQuestions: number; practicalCount: number; questionsAttempted: number }[];
  stats: {
    totalExamsCompleted: number;
    totalSubjectsSelected: number;
    totalQuestionsSolved: number;
    totalCorrect: number;
    totalWrong: number;
    overallAccuracy: number;
  };
  flags: {
    hasSelectedDefaultSubjects: boolean;
    hasPremiumOnAnyExam: boolean;
    showGoPremiumModal: boolean;
  };
  analytics: {
    subjectScores: ISubjectScores;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  accuracyDelta: {
    thisMonth: number | null;
    lastMonth: number | null;
    delta: number | null;
  };
  allowedExamTypes: IStudentExamType[];
  examsAvailable: IExamAvailable[];
}

export interface ISponsorProfile {
  id: string;
  sponsorType: string;
  companyName: string | null;
  totalStudentsSponsored: number;
  totalAmountDonated: number;
}

export interface ISponsorUrl {
  id: string;
  label: string;
  code: string;
  maxUses: number | null;
  usedCount: number;
  isDisabled: boolean;
  createdAt: string;
}

export interface ISponsorStudentRow {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isSponsored: boolean;
  defaultExamTypeId: string | null;
  createdAt: string;
  subscription: ISponsorSubscriptionRow | null;
}

export interface ISponsorSubscriptionRow {
  id: string;
  studentId: string;
  examTypeId: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  amountPaid: number;
  currency: string;
  plan?: { name: string; durationDays: number } | null;
  examType?: { name: string } | null;
}

export interface ISponsorGiveback {
  id: string;
  sponsorId: string;
  type: string;
  status: "pending" | "active" | "expired" | "failed";
  amount: number;
  currency: string;
  studentCount: number;
  endDate: string | null;
  bookCount?: number | null;
  hasResubbed: boolean;
  parentGivebackId: string | null;
  createdAt: string;
  // Enriched by backend: first linked subscription (for exam/plan labels)
  subscription?: ISponsorSubscriptionRow | null;
}

export interface IExpiringGivebackStudent {
  studentId: string;
  endDate: string;
  student?: { user?: { firstName: string; lastName: string; email: string } };
  examType?: { id: string; name: string } | null;
  plan?: { id: string; name: string; durationDays: number } | null;
  planPriceId?: string | null;
}

export interface IExpiringGiveback extends ISponsorGiveback {
  subscriptions: IExpiringGivebackStudent[];
  earliestExpiry: string | null;
}

export interface IInitiateRenewalResult {
  authorizationUrl: string;
  reference: string;
  newGivebackId: string;
  eligibleCount: number;
  conflicts: Array<{ studentId: string; reason: string }>;
}

export interface IGivebackDetail {
  giveback: ISponsorGiveback;
  subscriptions: Array<
    ISponsorSubscriptionRow & {
      student?: {
        user?: { firstName: string; lastName: string; email: string };
      };
    }
  >;
}

export interface IInitiateGivebackResult {
  authorizationUrl: string;
  reference: string;
  givebackId: string;
  eligibleCount: number;
  conflicts: Array<{ studentId: string; reason: string }>;
}

export interface ISponsorStudentStats {
  total: number;
  active: number;
  expiringSoon: number;
  enrollmentChange: number;
  conversionRate: number;
  thisMonthEnrolled: number;
  lastMonthEnrolled: number;
}

export interface ISponsorDashboard {
  totalGivebacks: number;
  givebacksChange: number;
  studentsEnrolled: number;
  activeStudents: number;
  expiringSoon: number;
  enrollmentChange: number;
  thisMonthEnrolled: number;
  examsCompleted: number;
  avgScore: number;
  recentGivebacks: ISponsorGiveback[];
  recentStudents: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    defaultExamTypeId: string | null;
    createdAt: string;
  }[];
}

export interface IAffiliateProfile {
  id: string;
  affiliateCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingBalance: number;
  totalConversions: number;
}

// Affiliate dashboard response
export interface IAffiliateDashboard {
  affiliateCode: string;
  totalReferrals: number;
  totalConversions: number;
  conversionRate: number;
  totalEarnings: number;
  pendingBalance: number;
  totalPaidOut: number;
  referredNotSubscribed: number;
  previousMonth: {
    referrals: number;
    conversions: number;
    earnings: number;
  };
}

// Affiliate referral
export interface IAffiliateReferral {
  id: string;
  referredUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  userType: string;
  hasSubscribed: boolean;
  subscribedAt: string | null;
  createdAt: string;
  totalRevenueGenerated: number;
  totalCommissionGenerated?: number;
  commissionPaid: boolean;
}

// Affiliate commission
export interface IAffiliateCommission {
  id: string;
  amount: number;
  status: string;
  subscriptionAmount: number;
  currency: string;
  planName: string;
  createdAt: string;
  referral?: {
    referredUser?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  subscription?: {
    status: string;
  };
}

// Payout account (bank account for withdrawal)
export interface IPayoutAccount {
  id: string;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string | null;
  isDefault: boolean;
  createdAt: string;
}

// Per-currency available withdrawal balance
export interface ICurrencyBalance {
  currency: string;
  available: number;
  totalEarned: number;
}

// Affiliate payout
export interface IAffiliatePayout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
  failureReason: string | null;
  payoutAccount: IPayoutAccount | null;
}

// Earnings by plan (for pie chart)
export interface IEarningsByPlan {
  planName: string;
  totalEarnings: string;
  count: string;
}

export interface IEarningsByCurrency {
  currency: string;
  totalEarnings: string;
  count: string;
}

// Earnings over time (for area chart)
export interface IEarningsOverTime {
  period: string;
  earnings: string;
  subscriptions: string;
}

// Active subscription (from backend)
export interface IUpcomingSubscription {
  id: string;
  planId: string;
  amountPaid: number;
  currency: string;
  scheduledStartDate: string | null;
  plan: {
    id: string;
    name: string;
    durationDays: number;
  } | null;
}

export interface IActiveSubscription {
  id: string;
  planId: string;
  status: string; // 'active' | 'cancelled' | 'suspended'
  amountPaid: number;
  currency: string;
  paymentProvider: string;
  startDate: string;
  endDate: string;
  nextPaymentDate: string | null; // Fetched live from Paystack — only for recurring active subs
  autoRenew: boolean;
  providerSubscriptionId: string | null;
  cancelledAt: string | null;
  upcomingSubscription: IUpcomingSubscription | null;
  plan: {
    id: string;
    name: string;
    durationDays: number;
    description: string | null;
  };
  // Card info from DB — avoids external API call at billing page load
  isSponsored: boolean;
  cardBrand: string | null;
  cardLast4: string | null;
  cardExpMonth: string | null;
  cardExpYear: string | null;
  cardBank: string | null;
  cardChannel: string | null;
}

// Summary of a single subscription (across exam types) used on the billing page
export interface ISubscriptionSummary {
  id: string;
  examTypeId: string;
  examTypeName: string | null;
  planId: string;
  status: string;
  amountPaid: number;
  currency: string;
  paymentProvider: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  providerSubscriptionId: string | null;
  cancelledAt: string | null;
  plan: { id: string; name: string; durationDays: number } | null;
  isSponsored: boolean;
  cardBrand: string | null;
  cardLast4: string | null;
  cardExpMonth: string | null;
  cardExpYear: string | null;
  cardBank: string | null;
  cardChannel: string | null;
}

// Card info (from subscription DB columns — no external API call at page load)
export interface ICardInfo {
  brand: string | null;
  last4: string | null;
  expMonth: string | null;
  expYear: string | null;
  bank: string | null;
  channel: string | null;
  provider?: "paystack" | "stripe";
  isSponsored: boolean;
}

// ── Exam History ────────────────────────────────────────────────────────────

export interface IExamAttempt {
  id: string;
  mode: string;
  examTypeName: string;
  totalQuestions: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  startedAt: string;
  completedAt: string | null;
  status: string;
  category: string | null;
}

export interface IDetailedResult {
  questionId: string;
  questionText: string;
  contentFormat?: 'markdown' | 'plate';
  questionType: string;
  topicId: string | null;
  topicName: string | null;
  explanation: string | null;
  marks: number;
  passageId: string | null;
  passage: { id: string; title: string; content: string; contentFormat?: 'markdown' | 'plate' } | null;
  options: { id: string; text: string; contentFormat?: 'markdown' | 'plate' }[];
  matchingPrompts?: string[];
  matchingOptions?: string[];
  studentAnswer: string | string[] | Record<string, string> | null;
  correctAnswer: string | string[] | Record<string, string> | null;
  isCorrect: boolean | null; // null for essays (not auto-graded)
}

/** Lightweight per-question status — powers the review navigator pills. */
export interface IQuestionStatus {
  questionId: string;
  isCorrect: boolean | null; // null = essay
  exemptFromMetrics: boolean; // true = essay
}

export interface IExamAttemptDetail {
  id: string;
  mode: string;
  examTypeName: string;
  subjectNames: string[];
  totalQuestions: number;
  totalCount: number; // total questions in this attempt (for pagination)
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  essayQuestions: number;
  scorePercentage: number;
  totalMarksObtained: number;
  totalMarksPossible: number;
  timeSpentSeconds: number;
  timeLimitSeconds: number | null;
  startedAt: string;
  completedAt: string | null;
  status: string;
  category: string | null;
  /** Lightweight status for ALL questions — used by navigator pills. */
  questionStatuses: IQuestionStatus[];
  /** First page of detailed results (20 questions). */
  detailedResults: IDetailedResult[];
}

// ── Exam Store Types ────────────────────────────────────────────────────────

export interface IExamOption {
  id: string;
  text: string;
  contentFormat?: 'markdown' | 'plate';
}

export interface IExamQuestion {
  id: string;
  questionText: string;
  contentFormat?: 'markdown' | 'plate';
  type: string; // QuestionType enum value
  marks: number;
  difficulty: string;
  passageId: string | null;
  options: IExamOption[];
  // Matching questions only (always present):
  matchingPrompts?: string[];
  matchingOptions?: string[];
  // Included only in revision/timed mode (not mock):
  correctAnswer?: string | string[] | Record<string, string>;
  topicId?: string | null;
  topicName?: string | null;
  explanation?: string | null;
}

export interface IExamPassage {
  id: string;
  title: string;
  content: string;
  contentFormat?: 'markdown' | 'plate';
}

export interface IPendingExamConfig {
  examTypeId: string;
  examTypeName: string;
  subjectIds: string[];
  subjectNames: string[];
  mode: "revision" | "timed" | "mock";
  questionCount?: number;
  timeLimitSeconds?: number;
  category?: string; // QuestionCategory — sent to backend to filter questions
  questionFilter?: "mixed" | "fresh" | "flagged" | "weak"; // Paid users only
  selectedTopicIds?: string[]; // Topic-priority filtering — paid users only
}

export interface IFlagUpdate {
  questionId: string;
  isFlagged: boolean; // true = flag/re-flag, false = remove
  flagType?: string;
  flagReason?: string;
}

export interface IExamSession {
  examAttemptId: string;
  mode: string;
  category?: string; // e.g. "theory" | "practical" | "objectives" — used to hide score for non-gradable categories
  timeLimitSeconds: number | null;
  startedAt: string;
  totalCount: number; // total questions in this exam (may exceed first-page size)
  questions: IExamQuestion[]; // first page only — use getQuestion() for all access
  passages: IExamPassage[];
  examTypeName: string;
  subjectNames: string[];
  // IDs the student previously flagged — pre-seeds flag UI state at exam start
  flaggedQuestionIds: string[];
}

export interface IMockConfig {
  standardDurationMinutes: number;
  standardQuestionCount: number;
}

export interface IExamResult {
  examAttemptId: string;
  status: string;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  essayQuestions: number;
  scorePercentage: number;
  totalMarksObtained: number;
  totalMarksPossible: number;
  timeSpentSeconds: number;
  detailedResults: any[];
}

export interface IQuestionResponse {
  questionId: string;
  answer: string | string[] | Record<string, string>;
  timeSpent: number;
  isFlagged?: boolean;
  flagType?: string;
  flagReason?: string;
}

export interface IExamStore {
  subjects: ISubject[];
  isLoadingSubjects: boolean;
  fetchSubjectsForExam: (examTypeId: string) => Promise<void>;

  mockConfig: IMockConfig | null;
  isLoadingMockConfig: boolean;
  fetchMockConfig: (examTypeId: string) => Promise<void>;

  pendingConfig: IPendingExamConfig | null;
  setPendingConfig: (config: IPendingExamConfig | null) => void;

  examSession: IExamSession | null;
  isStartingExam: boolean;
  startExam: () => Promise<void>;

  examResult: IExamResult | null;
  isSubmittingExam: boolean;
  submitExam: (
    responses: IQuestionResponse[],
    totalTimeSpent: number,
    flagUpdates?: IFlagUpdate[],
  ) => Promise<void>;

  // ── Page Cache (sliding window for large exams) ──────────────────────────
  // Questions are fetched in pages of PAGE_SIZE. The first page is seeded
  // from the startExam response; subsequent pages are fetched on demand.
  questionCache: Record<number, IExamQuestion[]>; // page index → questions
  passageCache: Record<string, IExamPassage>; // passageId → passage
  loadingPages: Set<number>;
  fetchPage: (page: number) => Promise<void>;
  prefetchAround: (questionIndex: number) => void; // 0-based index
  getQuestion: (index: number) => IExamQuestion | null; // 0-based index
  getPassage: (passageId: string) => IExamPassage | null;

  clearSession: () => void;

  // ── Topics ──────────────────────────────────────────────────────────────
  topics: ITopic[];
  topicsGrouped: Record<string, ITopic[]>; // subjectId → topics
  topicsHasMore: Record<string, boolean>;  // subjectId → hasMore
  topicsPage: Record<string, number>;      // subjectId → last loaded page
  topicsTotals: Record<string, number>;    // subjectId → real total count
  isLoadingTopics: boolean;
  fetchTopicsByExamType: (
    examTypeId: string,
    subjectIds?: string[],
    limit?: number,
  ) => Promise<void>;
  fetchTopicsForSubject: (subjectId: string, page?: number, limit?: number, examTypeId?: string) => Promise<ITopic[]>;
  searchTopics: (
    examTypeId: string,
    q: string,
    page?: number,
    limit?: number,
  ) => Promise<{ items: ITopic[]; total: number; hasMore: boolean }>;
  topicDetail: ITopic | null;
  isLoadingTopicDetail: boolean;
  fetchTopicDetail: (topicId: string) => Promise<void>;
  fetchTopicDetailRaw: (topicId: string) => Promise<ITopic | null>;
}

// ── Analytics types ─────────────────────────────────────────────────────────

export interface IAnalyticsSubjectScore {
  subjectId: string;
  subjectName: string;
  averageAccuracy: number; // mean accuracy %
}

export interface IAnalyticsProgressPoint {
  period: string; // YYYY-MM-DD
  accuracy: number; // weighted accuracy % for the slot
}

export interface IAnalyticsProgressOverTime {
  data: IAnalyticsProgressPoint[];
  granularity: string;
}

export interface IAnalyticsQuestionDistribution {
  correct: number;
  wrong: number;
  unanswered: number;
}

export interface IAnalyticsRankingBar {
  label: string; // e.g. "#3"
  score: number;
  isCurrentStudent: boolean;
}

export interface IAnalyticsRanking {
  rank: number;
  examCountRank: number;
  totalStudents: number;
  percentile: number;
  chartData: IAnalyticsRankingBar[];
}

export interface IAnalyticsSubjectAttempt {
  subjectId: string;
  subjectName: string;
  questionsAttempted: number;
}

// Student store types
export interface IStudentStore {
  hydrated: boolean;
  setHydrated: () => void;
  profile: IStudentProfile | null;
  setProfile: (profile: IStudentProfile | null) => void;
  clearProfile: () => void;
  lastExamTypeId: string | null;
  setLastExamTypeId: (id: string | null) => void;
  switchExamType: (examTypeId: string) => Promise<void>;
  dashboardData: IDashboardData | null;
  setDashboardData: (data: IDashboardData | null) => void;
  isLoadingDashboard: boolean;
  fetchDashboard: (granularity?: "day" | "week" | "month") => Promise<void>;
  // Granularity state for chart timeframe (persisted temporarily)
  granularity: "day" | "week" | "month";
  setGranularity: (granularity: "day" | "week" | "month") => void;
  isLoadingSubjectScores: boolean;
  fetchSubjectScores: (granularity: "day" | "week" | "month") => Promise<void>;
  // Subscription state
  activeSubscription: IActiveSubscription | null;
  isLoadingSubscription: boolean;
  fetchActiveSubscription: (examTypeId: string) => Promise<void>;
  // All subscriptions across exam types (billing overview)
  allSubscriptions: ISubscriptionSummary[];
  isLoadingAllSubscriptions: boolean;
  fetchAllSubscriptions: () => Promise<void>;
  cancelSubscription: (
    examTypeId: string,
    preFlight?: () => void,
  ) => Promise<void>;
  reactivateSubscription: (examTypeId: string) => Promise<void>;
  isReactivating: boolean;
  // Checkout info (plans + pricing for current region)
  checkoutInfo: ICheckoutInfo | null;
  isLoadingCheckoutInfo: boolean;
  fetchCheckoutInfo: (examTypeId: string, region?: string) => Promise<void>;
  // Card info (Paystack card details for active subscription)
  cardInfo: ICardInfo | null;
  isLoadingCardInfo: boolean;
  fetchCardInfo: (examTypeId: string) => Promise<void>;
  // Manage link (Paystack self-service portal URL)
  fetchManageLink: (
    examTypeId: string,
    callback?: (link: string) => void,
  ) => Promise<void>;
  // Initiate checkout (redirect to payment provider)
  initiateCheckout: (
    data: {
      planId: string;
      examTypeId: string;
      region: string;
      provider: "stripe" | "paystack";
    },
    callback?: (url: string) => void,
  ) => Promise<void>;
  isCheckingOut: boolean;
  // Upgrade subscription (switch to a different plan)
  isUpgrading: boolean;
  upgradeSubscription: (
    data: { targetPlanId: string; examTypeId: string },
    callback?: () => void,
  ) => Promise<void>;
  // Exam history
  examHistory: IExamAttempt[];
  examHistoryTotal: number;
  examHistoryPage: number;
  isLoadingExamHistory: boolean;
  fetchExamHistory: (page?: number, limit?: number) => Promise<void>;
  // Exam attempt detail (for history review page)
  examAttemptDetail: IExamAttemptDetail | null;
  isLoadingAttemptDetail: boolean;
  fetchExamAttemptDetail: (examAttemptId: string) => Promise<void>;
  // Review page cache (mirrors the live exam page cache for large attempts)
  reviewCache: Record<number, IDetailedResult[]>;
  reviewLoadingPages: number[];
  fetchReviewPage: (attemptId: string, page: number) => Promise<void>;
  prefetchReviewAround: (attemptId: string, questionIndex: number) => void;
  getReviewQuestion: (questionIndex: number) => IDetailedResult | null;
  // Analytics page
  analyticsSubjectScores: IAnalyticsSubjectScore[];
  analyticsSubjectScoresRange: { name: string; Score: number }[] | null;
  analyticsProgressOverTime: IAnalyticsProgressOverTime | null;
  analyticsQuestionDistribution: IAnalyticsQuestionDistribution | null;
  analyticsRanking: IAnalyticsRanking | null;
  analyticsSubjectAttempts: IAnalyticsSubjectAttempt[];
  isLoadingAnalytics: boolean;
  isLoadingProgressOverTime: boolean;
  isLoadingSubjectAttempts: boolean;
  isLoadingSubjectScoreAnalytics: boolean;
  isLoadingRankingAnalytics: boolean;
  /** Chart 3 (question distribution) only */
  fetchAnalytics: (opts: { examTypeId: string }) => Promise<void>;
  /** Chart 2 — granularity-only, calendar-relative */
  fetchAnalyticsProgressOverTime: (opts: {
    examTypeId: string;
    granularity: "day" | "week" | "month";
    timezone?: string;
  }) => Promise<void>;
  fetchAnalyticsSubjectAttempts: (opts: {
    examTypeId: string;
    granularity: "day" | "week" | "month";
    /** Specific date string (YYYY-MM-DD) for day-level filtering */
    date?: string;
    timezone?: string;
  }) => Promise<void>;
  /** Chart 1 — date range filter */
  fetchAnalyticsSubjectScoresRange: (opts: {
    examTypeId: string;
    startDate?: string;
    endDate?: string;
    timezone?: string;
  }) => Promise<void>;
  /** Chart 4 — date range filter, ranked by exam count */
  fetchAnalyticsRankingRange: (opts: {
    examTypeId: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
}

// Sponsor store types
export interface ISponsorStore {
  hydrated: boolean;
  setHydrated: () => void;
  profile: ISponsorProfile | null;
  setProfile: (profile: ISponsorProfile | null) => void;
  clearProfile: () => void;

  // Dashboard
  dashboard: ISponsorDashboard | null;
  isLoadingDashboard: boolean;
  fetchDashboard: () => Promise<void>;

  // Students
  students: ISponsorStudentRow[];
  studentsTotal: number;
  studentsPage: number;
  studentStats: ISponsorStudentStats | null;
  isLoadingStudents: boolean;
  isLoadingStats: boolean;
  isAddingStudent: boolean;
  fetchStudents: (page: number, limit?: number) => Promise<void>;
  fetchStudentStats: () => Promise<void>;
  addStudent: (
    data: {
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      examTypeId: string;
    },
    callback?: () => void,
  ) => Promise<void>;

  // Sponsor URLs
  sponsorUrls: ISponsorUrl[];
  isLoadingUrls: boolean;
  isCreatingUrl: boolean;
  fetchSponsorUrls: () => Promise<void>;
  createSponsorUrl: (
    data: { label: string; maxUses?: number | null },
    callback?: () => void,
  ) => Promise<void>;
  toggleSponsorUrl: (urlId: string) => Promise<void>;

  // Givebacks — per-tab state (all / active / expired), each with independent pagination
  givebacksAll: ISponsorGiveback[];
  givebacksAllTotal: number;
  givebacksAllPage: number;
  isLoadingGivebacksAll: boolean;
  givebacksActive: ISponsorGiveback[];
  givebacksActiveTotal: number;
  givebacksActivePage: number;
  isLoadingGivebacksActive: boolean;
  givebacksExpired: ISponsorGiveback[];
  givebacksExpiredTotal: number;
  givebacksExpiredPage: number;
  isLoadingGivebacksExpired: boolean;
  givebackStats: {
    totalSpent: number;
    totalGivebacks: number;
    thisMonthGivebacks: number;
    studentsSponsored: number;
    expiringSoon: number;
  } | null;
  isLoadingGivebackStats: boolean;
  isInitiatingGiveback: boolean;
  expiringGivebacks: IExpiringGiveback[];
  isLoadingExpiringGivebacks: boolean;
  isInitiatingRenewal: boolean;
  fetchGivebackStats: () => Promise<void>;
  fetchGivebacksAll: (page: number, limit?: number) => Promise<void>;
  fetchGivebacksActive: (page: number, limit?: number) => Promise<void>;
  fetchGivebacksExpired: (page: number, limit?: number) => Promise<void>;
  initGivebackTabs: (limit?: number) => Promise<void>;
  fetchExpiringGivebacks: () => Promise<void>;
  initiateGiveback: (
    data: {
      studentIds: string[];
      examTypeId: string;
      planId: string;
      planPriceId: string;
      provider: "stripe" | "paystack";
      customerEmail: string;
      callbackUrl: string;
    },
    callback?: (result: IInitiateGivebackResult) => void,
  ) => Promise<void>;
  initiateRenewal: (
    originalGivebackId: string,
    data: {
      studentIds: string[];
      examTypeId: string;
      planId: string;
      planPriceId: string;
      provider: "stripe" | "paystack";
      customerEmail: string;
      callbackUrl: string;
    },
    callback?: (result: IInitiateRenewalResult) => void,
  ) => Promise<void>;
  verifyGiveback: (
    reference: string,
    callback?: (activatedCount: number) => void,
  ) => Promise<void>;
}

// Affiliate store types
export interface IAffiliateStore {
  hydrated: boolean;
  setHydrated: () => void;
  profile: IAffiliateProfile | null;
  setProfile: (profile: IAffiliateProfile | null) => void;
  clearProfile: () => void;

  // Currency
  availableCurrencies: string[];
  selectedCurrency: string;
  currencyManuallySet: boolean;
  setCurrencies: (currencies: string[]) => void;
  setSelectedCurrency: (currency: string) => void;
  fetchCurrencies: () => Promise<void>;

  // Dashboard
  dashboard: IAffiliateDashboard | null;
  isLoadingDashboard: boolean;
  fetchDashboard: () => Promise<void>;

  // Commissions
  commissions: IAffiliateCommission[];
  commissionsTotal: number;
  commissionsPage: number;
  isLoadingCommissions: boolean;
  fetchCommissions: (page?: number, limit?: number) => Promise<void>;

  // Referrals
  referrals: IAffiliateReferral[];
  referralsTotal: number;
  referralsPage: number;
  isLoadingReferrals: boolean;
  fetchReferrals: (page?: number, limit?: number) => Promise<void>;

  // Earnings by plan
  earningsByPlan: IEarningsByPlan[];
  isLoadingEarningsByPlan: boolean;
  fetchEarningsByPlan: () => Promise<void>;

  // Earnings by currency (drives currency selector)
  earningsByCurrency: IEarningsByCurrency[];
  fetchEarningsByCurrency: () => Promise<void>;

  // Earnings over time
  earningsOverTime: IEarningsOverTime[];
  isLoadingEarningsOverTime: boolean;
  fetchEarningsOverTime: (
    startDate?: string,
    endDate?: string,
    granularity?: string,
  ) => Promise<void>;

  // Payouts
  payouts: IAffiliatePayout[];
  payoutsTotal: number;
  payoutsPage: number;
  isLoadingPayouts: boolean;
  fetchPayouts: (page?: number, limit?: number) => Promise<void>;

  // Payout accounts
  payoutAccounts: IPayoutAccount[];
  isLoadingPayoutAccounts: boolean;
  fetchPayoutAccounts: () => Promise<void>;
  addPayoutAccount: (
    data: {
      currency: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
      bankCode?: string;
      setAsDefault?: boolean;
    },
    callback?: () => void,
  ) => Promise<void>;
  removePayoutAccount: (accountId: string) => Promise<void>;
  setDefaultPayoutAccount: (accountId: string) => Promise<void>;
  isManagingPayoutAccount: boolean;

  // Per-currency balances
  currencyBalances: ICurrencyBalance[];
  isLoadingBalances: boolean;
  fetchBalances: () => Promise<void>;

  // Actions
  isWithdrawing: boolean;
  requestWithdrawal: (
    amount: number,
    currency: string,
    payoutAccountId: string,
    callback?: () => void,
  ) => Promise<void>;
  isUpdatingCode: boolean;
  checkCodeAvailability: (code: string) => Promise<{
    available: boolean;
    message?: string;
  }>;
  updateAffiliateCode: (code: string, callback?: () => void) => Promise<void>;
}

// Checkout info types (from backend)
export type SupportedCurrency =
  | "NGN"
  | "USD"
  | "GBP"
  | "EUR"
  | "CAD"
  | "AUD"
  | "GHS"
  | "ZAR"
  | "KES"
  | "UGX"
  | "TZS"
  | "XOF"
  | "XAF"
  | "GMD";

export interface ICheckoutPlan {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  planPriceId?: string;
  providers: Array<{ provider: "stripe" | "paystack" }>;
}

export interface ICheckoutInfo {
  region: string;
  currency: SupportedCurrency;
  plans: ICheckoutPlan[];
}

// ─── Chat types ───────────────────────────────────────────────────────────────

// "sending" = optimistic, not yet confirmed by server (frontend-only, never stored in DB)
export type ChatDeliveryStatus = "sending" | "sent" | "read";

export interface IChatMessage {
  id: string;
  tempId?: string; // optimistic bubble id (before server confirms)
  chatroomId: string;
  senderId: string;
  content: string;
  deliveryStatus: ChatDeliveryStatus;
  createdAt: string; // ISO string
  isFlagged?: boolean;
  flagReason?: string | null;
  failed?: boolean; // true if server returned message_failed
  restricted?: boolean; // true if server rejected for content policy violation
}

export interface IChatroomPartner {
  id: string;
  firstName: string;
  lastName: string;
  picture?: string | null;
}

export interface IChatroom {
  id: string;
  type: string;
  createdAt: string;
  partner: IChatroomPartner | null;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  lastReadAt: string | null;
}

export interface IPresence {
  isOnline: boolean;
  lastSeenAt: string | null;
}

export interface IComposeStudent {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string | null;
  studentProfileId?: string;
  role?: string;
}

export interface IChatStore {
  // Socket connection state
  isSocketConnected: boolean;
  setSocketConnected: (v: boolean) => void;

  // Chatrooms list
  chatrooms: IChatroom[];
  chatroomsHasMore: boolean;
  isLoadingChatrooms: boolean;
  chatroomSearchQuery: string;
  fetchChatrooms: (
    cursor?: string,
    merge?: boolean,
    query?: string,
  ) => Promise<void>;
  fetchChatroomById: (chatroomId: string) => Promise<void>;
  totalUnread: number;
  fetchTotalUnread: () => Promise<void>;

  // Messages (per chatroom, accumulated as user scrolls)
  messages: Record<string, IChatMessage[]>;
  messagesHasMore: Record<string, boolean>;
  isLoadingMessages: Record<string, boolean>;
  fetchMessages: (
    chatroomId: string,
    before?: string,
    merge?: boolean,
  ) => Promise<void>;

  // Active chatroom
  activeChatroomId: string | null;
  setActiveChatroomId: (id: string | null) => void;

  // Presence
  presence: Record<string, IPresence>;
  fetchPresence: (userIds: string[]) => Promise<void>;

  // Typing indicators (chatroomId → userId[])
  typing: Record<string, string[]>;

  // Send
  sendMessage: (chatroomId: string, content: string) => void;
  isSending: boolean;

  // Flag
  flagMessage: (
    messageId: string,
    chatroomId: string,
    reason?: string,
  ) => Promise<void>;
  isFlagging: boolean;

  // Unread anchor — set from raw server response in fetchMessages, cleared on read
  chatroomUnreadAnchor: Record<string, { id: string; count: number } | null>;
  clearChatroomUnreadAnchor: (chatroomId: string) => void;
  clearChatroomData: (chatroomId: string) => void;

  // Mark read (debounced in component, store just emits with ack+retry)
  emitMessagesRead: (chatroomId: string) => void;

  // Retry a failed message (removes the failed bubble, re-sends content)
  retryMessage: (chatroomId: string, tempId: string, content: string) => void;

  // Typing emit (throttle/debounce handled in component)
  emitTypingStart: (chatroomId: string) => void;
  emitTypingStop: (chatroomId: string) => void;

  // Join / leave chatroom room
  joinChatroom: (chatroomId: string) => void;
  leaveChatroom: (chatroomId: string) => void;

  // Compose modal — sponsor searches their students
  composeStudents: IComposeStudent[];
  isLoadingComposeStudents: boolean;
  searchSponsorStudents: (query?: string) => Promise<void>;

  // Compose modal — student searches by email
  composeSearchResults: IComposeStudent[];
  isSearchingUsers: boolean;
  searchUsersByEmail: (email: string) => Promise<void>;

  // Create chatroom (sponsor or student initiates)
  createChatroom: (
    studentUserIds: string[],
    initialMessage?: string,
    callback?: (firstChatroomId: string) => void,
  ) => Promise<void>;
  isCreatingChatroom: boolean;

  // WS event handlers (called by SocketProvider)
  onNewMessage: (msg: IChatMessage) => void;
  onNewMessageNotification: (
    chatroomId: string,
    preview: string,
    senderId: string,
    createdAt: string,
  ) => void;
  onMessageConfirmed: (tempId: string, message: IChatMessage) => void;
  onMessageFailed: (tempId: string, chatroomId: string) => void;
  onMessageRestricted: (tempId: string, chatroomId: string) => void;
  onMessageIdAssigned: (tempId: string, id: string, chatroomId: string) => void;
  onMessageFlagged: (
    messageId: string,
    chatroomId: string,
    flagReason: string | null,
  ) => void;
  onTyping: (userId: string, chatroomId: string, typing: boolean) => void;
  onPresenceUpdate: (
    userId: string,
    isOnline: boolean,
    lastSeenAt: string | null,
  ) => void;
  onChatroomCreated: (
    chatroom: IChatroom,
    message: IChatMessage | null,
  ) => void;
  onMessagesRead: (chatroomId: string, userId: string, readAt: string) => void;
}

// ─── Notification types ───────────────────────────────────────────────────────

export type NotificationType =
  | "new_message"
  | "new_chatroom"
  | "giveback_activated"
  | "subscription_expiring"
  | "subscription_expired"
  | "exam_result"
  | "flagged_message_reviewed";

export interface INotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  url: string;
  isRead: boolean;
  readAt: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface INotificationStore {
  // Bell panel (last 20, quick glance)
  recentNotifications: INotification[];
  unreadCount: number;
  isLoadingRecent: boolean;
  fetchRecentNotifications: () => Promise<void>;

  // Full notifications page (paginated)
  notifications: INotification[];
  notificationsTotal: number;
  notificationsPage: number;
  isLoadingNotifications: boolean;
  fetchNotifications: (
    page?: number,
    limit?: number,
    merge?: boolean,
  ) => Promise<void>;

  // Actions
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  isMarkingRead: boolean;

  // WS event handlers
  onNotificationCreated: (notification: INotification) => void;
  onNotificationsMarkedRead: (ids: string[]) => void;
}
