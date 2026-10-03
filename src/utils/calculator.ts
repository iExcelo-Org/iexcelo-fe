export function safeEval(expr: string): number | null {
  if (!expr) return null;
  try {
    if (!/^[\d+\-*/.() ]+$/.test(expr)) return null;
    const result = new Function(`return (${expr})`)() as number;
    return typeof result === "number" && isFinite(result) ? result : null;
  } catch {
    return null;
  }
}
