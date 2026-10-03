/**
 * Format a YYYY-MM-DD period string into a human-readable chart x-axis label.
 * Matches the backend's CHART_DATA_RULES granularity contract.
 */
export function formatPeriodLabel(
  period: string,
  granularity: "day" | "week" | "month",
): string {
  const d = new Date(period); // ISO date-only → UTC midnight
  if (granularity === "month") {
    return d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  }
  if (granularity === "week") {
    const end = new Date(d);
    end.setUTCDate(d.getUTCDate() + 6);
    const s = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    const eMonth = end.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const eDay = end.toLocaleDateString("en-US", {
      day: "numeric",
      timeZone: "UTC",
    });
    const sMonth = d.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    return `${s}–${sMonth === eMonth ? eDay : `${eMonth} ${eDay}`}`;
  }
  // day: "Sun 23"
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
