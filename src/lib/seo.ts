import type { Robots } from "next/dist/lib/metadata/types/metadata-types";

export const BASE_URL = "https://iexcelo.co";

export const SITE_NAME = "iExcelo";

export const OG_IMAGE = {
  url: `${BASE_URL}/seo/open-graph.png`,
  width: 1200,
  height: 630,
  alt: "iExcelo – Nigeria's #1 Exam Revision Platform for WAEC, JAMB, NECO & SAT",
} as const;

export const BASE_ROBOTS: Robots = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export const NOINDEX_ROBOTS: Robots = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export const KEYWORDS = [
  "iExcelo",
  "exam revision Nigeria",
  "WAEC past questions",
  "JAMB past questions",
  "NECO past questions",
  "SAT preparation",
  "online exam preparation Nigeria",
  "past questions and answers",
  "WAEC preparation",
  "JAMB CBT practice",
  "NECO revision",
  "secondary school exam prep",
  "university entrance exam Nigeria",
  "study smarter",
  "exam success Nigeria",
  "academic excellence Nigeria",
  "student learning platform",
  "educational technology Nigeria",
];
