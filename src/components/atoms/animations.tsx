"use client";

import { motion } from "framer-motion";
import React, { CSSProperties, ReactNode } from "react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease, delay },
  }),
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease },
  },
};

const viewport = { once: true, margin: "-60px" };

interface FadeInProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
}

export function FadeIn({ children, className, style, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      className={className}
      style={style}
      custom={delay}
      variants={fadeVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}

interface FadeInImgProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
  loading?: "lazy" | "eager";
  delay?: number;
}

export function FadeInImg({ delay = 0, ...props }: FadeInImgProps) {
  return (
    <motion.img
      {...props}
      custom={delay}
      variants={fadeVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    />
  );
}

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function ScaleIn({ children, className, style }: ScaleInProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={scaleVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}
