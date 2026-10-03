export function calculateGrowth(
  current: number,
  previous: number,
): { percentage: string; isPositive: boolean } {
  if (previous === 0) {
    if (current > 0) return { percentage: "100.0", isPositive: true };
    return { percentage: "0.0", isPositive: true };
  }
  const change = ((current - previous) / previous) * 100;
  return { percentage: Math.abs(change).toFixed(1), isPositive: change >= 0 };
}
