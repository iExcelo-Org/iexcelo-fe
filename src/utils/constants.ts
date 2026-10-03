export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
export const API_KEY = process.env.NEXT_PUBLIC_X_API_KEY || "";
// WS_URL points to the backend root (without /api/v1 — Socket.IO registers at root)
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(
    "/api/v1",
    "",
  );

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "C$",
  AUD: "A$",
};

export const PERIOD_OPTIONS = [
  { label: "This month", value: "month" },
  { label: "Today", value: "day" },
  { label: "This week", value: "week" },
  { label: "This year", value: "year" },
];

export const RECORDS_PER_PAGE = 10;

export const CARD_SHADOW =
  "0 4px 4px 0 rgba(0,0,0,0.00), 0 7px 12px 0 rgba(0,0,0,0.02)";

// Granularity options for chart period selectors.
// `value` maps directly to the backend granularity param.
export const GRANULARITY_OPTIONS = [
  { label: "Daily", value: "day" as const, hint: "This week" },
  { label: "Weekly", value: "week" as const, hint: "This month" },
  { label: "Monthly", value: "month" as const, hint: "This year" },
];

// Chart color palette used for earnings/commission breakdowns.
export const BRAND_COLORS = [
  "#3399FF",
  "#000077",
  "#E32E89",
  "#6A7BD6",
  "#F3A218",
  "#099137",
];

// Chart color palette used for per-subject score breakdowns.
export const SUBJECT_COLORS = [
  "#007FFF", // platform primary blue
  "#A12161", // platform primary pink/magenta
  "#4BABFF", // light blue
  "#D4527A", // rose pink
  "#0052CC", // deep blue
  "#E91E8C", // vivid pink
  "#66C2FF", // sky blue
  "#8B1A50", // deep magenta
];

/** Questions per page for exam and history pagination. Must be a divisor of the backend PAGE_SIZE (100). */
export const EXAM_PAGE_SIZE = 20;

export const EXAM_QUESTION_OPTIONS = [
  { value: 10, label: "10 questions" },
  { value: 20, label: "20 questions" },
  { value: 30, label: "30 questions" },
  { value: 40, label: "40 questions" },
  { value: 50, label: "50 questions" },
];

export const EXAM_TIME_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "120 minutes" },
];

export const FAQ_CATEGORIES = [
  "general",
  "exam-revision-platform",
  "give-back",
  "affiliate-program",
] as const;
