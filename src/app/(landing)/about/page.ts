import type { Metadata } from "next";
import About from "./About";

export const metadata: Metadata = {
  title: "iExcelo - About Us",
  description:
    "Learn about iExcelo — the platform bridging exam preparation and opportunity for Nigerian students. Meet the team driving our mission to make quality education accessible through smart revision tools, GiveBack, and Affiliate programs.",
  alternates: { canonical: "https://iexcelo.co/about" },
  openGraph: {
    type: "website",
    url: "https://iexcelo.co/about",
    siteName: "iExcelo",
    title: "About iExcelo – The Team Behind Nigeria's #1 Exam Revision Platform",
    description:
      "Discover the story, mission, and values behind iExcelo. We're on a mission to make quality exam preparation accessible, engaging, and meaningful for every Nigerian student.",
    images: [
      {
        url: "https://iexcelo.co/seo/open-graph.png",
        width: 1200,
        height: 630,
        alt: "iExcelo – About Us",
      },
    ],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "About iExcelo – The Team Behind Nigeria's #1 Exam Revision Platform",
    description:
      "Discover the story, mission, and values behind iExcelo — bridging exam preparation and opportunity for Nigerian students.",
    images: ["https://iexcelo.co/seo/open-graph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default About;
