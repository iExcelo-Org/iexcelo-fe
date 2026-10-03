const PLAN_PALETTES = [
  { bg: "#FDE8D8", text: "#C0441E" }, // warm orange
  { bg: "#DAEAF7", text: "#2A6496" }, // cool blue
  { bg: "#E8E0F7", text: "#5B3FA6" }, // soft purple
  { bg: "#D8F5E8", text: "#1A7A4A" }, // mint green
  { bg: "#FFF3CD", text: "#856404" }, // amber
  { bg: "#F7D8E8", text: "#A6245B" }, // rose
];

/**
 * Turns any string into a stable index via djb2 hash
 */
function hashString(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Returns { bg, text } hex colors for any plan name
 */
export function getColorsFromWord(planName: string) {
  const index = hashString(planName) % PLAN_PALETTES.length;
  return PLAN_PALETTES[index];
}
