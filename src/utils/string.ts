/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The string with the first letter capitalized
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Simple alias for capitalizing a single word/string.
 * Kept for ergonomic imports like `capitalize(...)`.
 */
export function capitalize(str: string): string {
  return capitalizeFirstLetter(str);
}

/**
 * Capitalizes the first letter of each word in a string
 * @param str - The string to capitalize
 * @returns The string with each word capitalized
 */
export function capitalizeWords(str: string): string {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}

/**
 * Strips markdown syntax and HTML tags from a string for use in previews.
 * Handles bold, italic, code, headings, links, images, and HTML entities.
 */
export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function stripMarkdownPreview(
  content: string,
  maxLen = 120,
  ellipsis = false,
): string {
  const stripped = content
    .replace(/<\/(p|div|li|blockquote|h[1-6])>/gi, " ")
    .replace(/<(br|hr)\s*\/?>/gi, " ")
    .replace(/<img[^>]*>/gi, "(Image)")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "(Image)")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#+\s/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\$\$?[^$]*\$\$?/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const truncated = stripped.slice(0, maxLen);
  return ellipsis && stripped.length > maxLen ? truncated + "…" : truncated;
}
