"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import katex from "katex";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github-dark.css";

// ─── Plate Slate node types ────────────────────────────────────────────────────

type TextNode = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  code?: boolean;
};

type ElementNode = {
  type: string;
  children: SlateNode[];
  url?: string;
  alt?: string;
  texExpression?: string;
  listStyleType?: string;
  indent?: number;
  colSizes?: number[];
  size?: number;
  width?: string | number;
  align?: string;
  lang?: string;
};

type SlateNode = TextNode | ElementNode;

function isText(node: SlateNode): node is TextNode {
  return "text" in node;
}

// ─── KaTeX helper ─────────────────────────────────────────────────────────────

function renderKatex(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex ?? "", { throwOnError: false, displayMode: display, output: "html" });
  } catch { return tex ?? ""; }
}

// ─── Code text extractor ─────────────────────────────────────────────────────

function extractCodeText(nodes: SlateNode[]): string {
  return nodes.map(node => {
    if (isText(node)) return node.text;
    const el = node as ElementNode;
    return el.children.map(c => isText(c) ? c.text : "").join("");
  }).join("\n");
}

// ─── Leaf renderer ────────────────────────────────────────────────────────────

function renderLeaf(leaf: TextNode, key: string | number): React.ReactNode {
  let content: React.ReactNode = leaf.text;
  if (leaf.bold)          content = <strong key={key}>{content}</strong>;
  if (leaf.italic)        content = <em>{content}</em>;
  if (leaf.underline)     content = <u>{content}</u>;
  if (leaf.strikethrough) content = <s>{content}</s>;
  if (leaf.subscript)     content = <sub>{content}</sub>;
  if (leaf.superscript)   content = <sup>{content}</sup>;
  if (leaf.code)          content = <code>{content}</code>;
  return <span key={key}>{content}</span>;
}

// ─── Node renderer (recursive) ────────────────────────────────────────────────

function renderChildren(nodes: SlateNode[]): React.ReactNode {
  return nodes.map((node, i) =>
    isText(node) ? renderLeaf(node, i) : renderNode(node, i)
  );
}

function renderNode(node: ElementNode, key: string | number): React.ReactNode {
  const kids = renderChildren(node.children);

  switch (node.type) {
    case "h1": return <h1 key={key}>{kids}</h1>;
    case "h2": return <h2 key={key}>{kids}</h2>;
    case "h3": return <h3 key={key}>{kids}</h3>;
    case "h4": return <h4 key={key}>{kids}</h4>;
    case "h5": return <h5 key={key}>{kids}</h5>;
    case "h6": return <h6 key={key}>{kids}</h6>;

    case "blockquote":
      return <blockquote key={key}>{kids}</blockquote>;

    case "hr":
      return <hr key={key} />;

    case "code_block": {
      const lang = node.lang ?? "";
      const codeText = extractCodeText(node.children);
      let highlighted: string;
      try {
        highlighted = lang && hljs.getLanguage(lang)
          ? hljs.highlight(codeText, { language: lang }).value
          : hljs.highlightAuto(codeText).value;
      } catch {
        highlighted = codeText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
      return (
        <div key={key} className="relative my-4">
          {lang && (
            <span className="absolute top-2 right-3 z-10 select-none rounded-full bg-[#2D3A4D] px-2 py-0.5 font-mono text-[10px] text-[#8B9CC8]">
              {lang}
            </span>
          )}
          <pre className="!my-0 overflow-x-auto rounded-xl !p-4 !text-sm">
            <code
              className={`hljs !bg-transparent !p-0 !text-[0.875em]${lang ? ` language-${lang}` : ""}`}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>
      );
    }

    case "code_line":
      return null;

    case "table": {
      const rawSizes = node.colSizes ?? [];
      let pcts: string[] = [];
      if (rawSizes.length > 0) {
        const nonZero = rawSizes.filter(Boolean);
        const avg = nonZero.length > 0 ? nonZero.reduce((s, w) => s + w, 0) / nonZero.length : 1;
        const effective = rawSizes.map(w => (w === 0 ? avg : w));
        const total = effective.reduce((s, w) => s + w, 0);
        pcts = effective.map(w => (total > 0 ? ((w / total) * 100).toFixed(2) + "%" : `${100 / effective.length}%`));
      }
      return (
        <div key={key} className="my-4 overflow-hidden rounded-xl border border-[#E4E7EC]">
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse text-sm [&_td:last-child]:border-r-0 [&_th:last-child]:border-r-0 [&_tr:last-child_td]:border-b-0 [&_tr:last-child_th]:border-b-0"
              style={{ tableLayout: pcts.length > 0 ? "fixed" : "auto" }}
            >
              {pcts.length > 0 && (
                <colgroup>
                  {pcts.map((pct, i) => <col key={i} style={{ width: pct }} />)}
                </colgroup>
              )}
              <tbody>{kids}</tbody>
            </table>
          </div>
        </div>
      );
    }

    case "tr": {
      const rowHeight = node.size;
      return (
        <tr
          key={key}
          className="border-b border-[#E4E7EC] last:border-0 odd:bg-white even:bg-[#FAFAFA]"
          style={rowHeight ? { height: rowHeight } : undefined}
        >
          {kids}
        </tr>
      );
    }

    case "td":
      return (
        <td key={key} className="border-b border-r border-[#E4E7EC] px-3 py-2 align-top text-[#344054] [&_p]:mb-0 [&_p:last-child]:mb-0" style={{ wordBreak: "break-word", height: "2.5rem" }}>
          {kids}
        </td>
      );

    case "th":
      return (
        <th key={key} className="border-b border-r border-[#E4E7EC] bg-[#F9FAFB] px-3 py-2 text-left text-sm font-semibold text-[#344054] [&_p]:mb-0 [&_p:last-child]:mb-0" style={{ wordBreak: "break-word", height: "2.5rem" }}>
          {kids}
        </th>
      );

    case "column_group":
      return (
        <div key={key} className="flex gap-4 my-2">
          {kids}
        </div>
      );

    case "column": {
      const colWidth = node.width;
      return (
        <div key={key} style={colWidth ? { width: colWidth, flexShrink: 0 } : { flex: 1 }}>
          {kids}
        </div>
      );
    }

    case "equation":
      return (
        <div
          key={key}
          className="my-5 overflow-x-auto text-center py-3 rounded-lg bg-[#FAFAFA] border border-[#E4E7EC]"
          dangerouslySetInnerHTML={{ __html: renderKatex(node.texExpression ?? "", true) }}
        />
      );

    case "inline_equation":
      return (
        <span
          key={key}
          className="inline-flex items-center align-middle px-0.5"
          dangerouslySetInnerHTML={{ __html: renderKatex(node.texExpression ?? "", false) }}
        />
      );

    case "img":
      return (
        <RichTextImage
          key={key}
          src={node.url ?? ""}
          alt={node.alt ?? ""}
          width={typeof node.width === "number" ? node.width : undefined}
          align={node.align}
        />
      );

    case "a":
      return (
        <a
          key={key}
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#007FFF] underline underline-offset-2 hover:text-[#0066CC] transition-colors"
        >
          {kids}
        </a>
      );

    case "p": {
      if (node.listStyleType) {
        return (
          <div
            key={key}
            style={{
              display: "list-item",
              listStyleType: node.listStyleType,
              listStylePosition: "outside",
              marginLeft: `${1 + (node.indent ?? 1) * 1.5}em`,
            }}
          >
            {kids}
          </div>
        );
      }
      return <p key={key}>{kids}</p>;
    }

    default:
      return <div key={key}>{kids}</div>;
  }
}

// ─── Image with lightbox ───────────────────────────────────────────────────────

function RichTextImage({ src, alt, width, align }: { src: string; alt: string; width?: number; align?: string }) {
  const [open, setOpen] = useState(false);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); }
  }, []);

  if (!src) return null;

  const imgStyle: React.CSSProperties = {};
  if (width) imgStyle.width = width;
  if (align === "center") { imgStyle.marginLeft = "auto"; imgStyle.marginRight = "auto"; }
  else if (align === "right") imgStyle.marginLeft = "auto";

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-72 object-contain rounded-xl my-4 block cursor-zoom-in border border-[#E4E7EC] shadow-sm"
        style={imgStyle}
        tabIndex={0}
        role="button"
        aria-label="View full size"
        onClick={() => setOpen(true)}
        onKeyDown={handleKey}
      />
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-xl cursor-zoom-out shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ─── RichTextV2 ───────────────────────────────────────────────────────────────

interface RichTextV2Props {
  /** Plate JSON string — a serialized `Value` (array of Slate nodes) */
  content: string;
  className?: string;
  variant?: "block" | "inline";
}

/**
 * Static renderer for Plate.js JSON content.
 * Handles headings, lists, tables, blockquotes, code, math (KaTeX), images with lightbox, links, and all text marks.
 */
export function RichTextV2({ content, className, variant = "block" }: RichTextV2Props) {
  let nodes: ElementNode[] = [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) nodes = parsed as ElementNode[];
  } catch { return null; }

  if (!nodes.length) return null;

  return (
    <div
      className={cn(
        "text-inherit leading-relaxed max-w-full",
        variant === "block" && [
          // paragraphs
          "[&_p]:mb-3 [&_p:last-child]:mb-0 [&_p]:text-[#344054]",
          // headings
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:text-[#101828] [&_h1]:leading-tight",
          "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-2 [&_h2]:text-[#101828] [&_h2]:pb-1.5 [&_h2]:border-b [&_h2]:border-[#F2F4F7]",
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-1 [&_h3]:text-[#344054]",
          "[&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:text-[#344054]",
          "[&_h5]:text-sm [&_h5]:font-semibold [&_h5]:mb-1.5 [&_h5]:text-[#344054]",
          "[&_h6]:text-xs [&_h6]:font-semibold [&_h6]:uppercase [&_h6]:tracking-wider [&_h6]:mb-1.5 [&_h6]:text-[#667085]",
          // inline marks
          "[&_strong]:font-semibold [&_strong]:text-[#101828]",
          "[&_em]:italic",
          "[&_u]:underline [&_u]:underline-offset-2",
          "[&_s]:line-through [&_s]:text-[#98A2B3]",
          // code
          "[&_code]:bg-[#F2F4F7] [&_code]:text-[#C7253E] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.875em] [&_code]:font-mono",
          // code blocks (bg/border come from inline pre; token colors from hljs github-dark CSS)
          "[&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:my-4 [&_pre]:border [&_pre]:border-[#2D3A4D] [&_pre]:leading-relaxed",
          "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[0.875em]",
          // blockquote
          "[&_blockquote]:border-l-[3px] [&_blockquote]:border-[#007FFF] [&_blockquote]:bg-[#F0F7FF] [&_blockquote]:pl-4 [&_blockquote]:pr-3 [&_blockquote]:py-2.5 [&_blockquote]:rounded-r-lg [&_blockquote]:text-[#344054] [&_blockquote]:italic [&_blockquote]:mb-3",
          // hr
          "[&_hr]:my-5 [&_hr]:border-[#E4E7EC]",
          // math
          "[&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto",
        ],
        variant === "inline" && [
          "[&_p]:inline [&_p]:m-0",
          "[&_.katex-display]:my-1 [&_.katex-display]:overflow-x-auto",
          "[&_img]:max-w-full [&_img]:max-h-40 [&_img]:object-contain [&_img]:rounded [&_img]:block",
          "[&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap",
          "[&_code]:break-all",
        ],
        className,
      )}
    >
      {nodes.map((node, i) => renderNode(node, i))}
    </div>
  );
}
