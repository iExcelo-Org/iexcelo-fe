import type { Metadata } from "next";
import Home from "./Home";

export const metadata: Metadata = {
  title: "iExcelo – Revise Smarter, Excel in Every Exam",
  description:
    "iExcelo is Nigeria's #1 exam revision platform. Access thousands of curated past questions with expert explanations for WAEC, JAMB, NECO & SAT. Track your progress, join the GiveBack program, and earn with our Affiliate program.",
  keywords: [
    "iExcelo",
    "WAEC past questions",
    "JAMB past questions",
    "NECO past questions",
    "SAT preparation",
    "exam revision Nigeria",
    "online exam prep",
    "past questions and answers Nigeria",
    "WAEC preparation",
    "JAMB CBT practice",
    "NECO revision",
    "exam success Nigeria",
    "student learning platform Nigeria",
    "academic excellence",
    "university entrance exam Nigeria",
    "secondary school exams",
    "giveback education Nigeria",
    "affiliate program education",
  ],
  alternates: { canonical: "https://iexcelo.co" },
  openGraph: {
    type: "website",
    url: "https://iexcelo.co",
    siteName: "iExcelo",
    title: "iExcelo – Revise Smarter, Excel in Every Exam",
    description:
      "Nigeria's #1 exam revision platform for WAEC, JAMB, NECO & SAT. Curated past questions, expert explanations, real-time progress tracking, and a GiveBack program that makes education accessible for all.",
    images: [
      {
        url: "https://iexcelo.co/seo/open-graph.png",
        width: 1200,
        height: 630,
        alt: "iExcelo – Nigeria's #1 Exam Revision Platform",
      },
    ],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "iExcelo – Revise Smarter, Excel in Every Exam",
    description:
      "Nigeria's #1 exam revision platform for WAEC, JAMB, NECO & SAT. Curated past questions, expert explanations, and a GiveBack program for every student.",
    images: ["https://iexcelo.co/seo/open-graph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default Home;
