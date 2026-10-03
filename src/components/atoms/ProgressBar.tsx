"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number; // 0 - 100
  height?: number; // px
  colors?: string[]; // e.g. ["#FF3B30", "#FF9500", "#FFD60A", "#1E8FFF", "#0E43FF"]
  duration?: number; // ms
}

const defaultColors = [
  "#FF3B30", // red
  "#FF6A00", // orange-red
  "#FF9500", // orange
  "#FFD60A", // yellow
  "#34C759", // green
  "#1E8FFF", // light blue
  "#0E43FF", // deep blue
];

function interpolateColor(colors: string[], value: number): string {
  const clamped = Math.min(100, Math.max(0, value));
  const ratio = clamped / 100;
  const segment = 1 / (colors.length - 1);
  const index = Math.min(Math.floor(ratio / segment), colors.length - 2);
  const localRatio = (ratio - index * segment) / segment;

  const hex = (c: string) => {
    const n = c.replace("#", "");
    return [
      parseInt(n.slice(0, 2), 16),
      parseInt(n.slice(2, 4), 16),
      parseInt(n.slice(4, 6), 16),
    ];
  };

  const [r1, g1, b1] = hex(colors[index]);
  const [r2, g2, b2] = hex(colors[index + 1]);

  const r = Math.round(r1 + (r2 - r1) * localRatio);
  const g = Math.round(g1 + (g2 - g1) * localRatio);
  const b = Math.round(b1 + (b2 - b1) * localRatio);

  return `rgb(${r}, ${g}, ${b})`;
}

export function ProgressBar({
  value,
  height = 12,
  colors = defaultColors,
  duration = 700,
}: ProgressBarProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const start = displayed;
    const end = Math.min(100, Math.max(0, value));
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease in out cubic
      const ease =
        progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

      const current = start + (end - start) * ease;
      setDisplayed(current);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const color = interpolateColor(colors, displayed);
  const glowColor = interpolateColor(colors, displayed);

  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{
        height,
        background: "#F0F0F0",
      }}
    >
      <div
        className="h-full rounded-full relative overflow-hidden"
        style={{
          width: `${displayed}%`,
          background: color,
          boxShadow: `0 0 10px 0 ${glowColor}80`,
          transition: "box-shadow 0.3s",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
      </div>
    </div>
  );
}
