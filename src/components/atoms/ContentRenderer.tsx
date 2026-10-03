import { RichText } from "./RichText";
import { RichTextV2 } from "./RichTextV2";

interface ContentRendererProps {
  content: string;
  contentFormat?: "markdown" | "plate";
  className?: string;
  variant?: "block" | "inline";
}

/**
 * Renders rich content. Always auto-detects format from actual content so that
 * a question whose questionText was converted to plate but whose explanation
 * remains markdown still renders both fields correctly regardless of the single
 * stored contentFormat field.
 *
 * - Plate JSON (JSON array)  → RichTextV2
 * - Markdown / plain text    → RichText
 */
export function ContentRenderer({
  content,
  className,
  variant = "block",
}: ContentRendererProps) {
  if (!content) return null;

  let isPlate = false;
  try {
    const p = JSON.parse(content);
    isPlate = Array.isArray(p);
  } catch { /* markdown */ }

  if (isPlate) {
    return <RichTextV2 content={content} className={className} variant={variant} />;
  }
  return <RichText content={content} className={className} variant={variant} />;
}
