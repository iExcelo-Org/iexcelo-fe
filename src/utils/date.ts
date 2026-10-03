export function formatDate(
  dateInput: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale = "en-GB",
): string {
  if (!dateInput) return "N/A";

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  const defaultOptions: Intl.DateTimeFormatOptions = options ?? {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  return date.toLocaleDateString(locale, defaultOptions);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = d
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", "");
  return `${datePart}, ${timePart}`;
}

export function formatTimeFromSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function countdownFromMs(ms: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} | null {
  if (ms <= 0) return null;
  return {
    days: Math.floor(ms / (1000 * 60 * 60 * 24)),
    hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((ms % (1000 * 60)) / 1000),
  };
}

function toUTC(iso: string): Date {
  return new Date(/Z$|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z");
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - toUTC(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
