import type { Metadata } from "next";
import Revisions from "./Revisions";

export const metadata: Metadata = {
  title: "iExcelo - Exam Revision",
  description:
    "Prepare smarter with iExcelo Exam Revision. Access thousands of curated past questions for WAEC, JAMB, NECO & SAT with expert explanations, topic summaries, real-time performance scores, and 24/7 access from any device.",
  alternates: { canonical: "https://iexcelo.co/revisions" },
  openGraph: {
    type: "website",
    url: "https://iexcelo.co/revisions",
    siteName: "iExcelo",
    title: "iExcelo Exam Revision – Your Smart Companion for Exam Success",
    description:
      "Master every topic, one question at a time. Curated past exam questions, expert explanations, topic summaries, and real-time progress tracking for WAEC, JAMB, NECO & SAT.",
    images: [
      {
        url: "https://iexcelo.co/seo/open-graph.png",
        width: 1200,
        height: 630,
        alt: "iExcelo – Exam Revision Platform",
      },
    ],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "iExcelo Exam Revision – Your Smart Companion for Exam Success",
    description:
      "Master every topic with curated past questions, expert explanations, and real-time progress scores. Available 24/7 on any device.",
    images: ["https://iexcelo.co/seo/open-graph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default Revisions;
