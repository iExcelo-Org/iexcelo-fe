import type { Metadata } from "next";
import GiveBack from "./GiveBack";

export const metadata: Metadata = {
  title: "iExcelo - GiveBack Program",
  description:
    "Join the iExcelo GiveBack program — connect your generosity with students in need. Sponsor exam revision subscriptions, track your impact in real time, and send encouraging messages directly to the students you support.",
  alternates: { canonical: "https://iexcelo.co/giveback" },
  openGraph: {
    type: "website",
    url: "https://iexcelo.co/giveback",
    siteName: "iExcelo",
    title: "iExcelo GiveBack – Learn, Excel, and Make a Difference",
    description:
      "Sponsor a student's exam revision journey. iExcelo GiveBack connects your donation to real educational impact — track progress, send messages, and build a legacy that lasts.",
    images: [
      {
        url: "https://iexcelo.co/seo/open-graph.png",
        width: 1200,
        height: 630,
        alt: "iExcelo – GiveBack Program",
      },
    ],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "iExcelo GiveBack – Learn, Excel, and Make a Difference",
    description:
      "Sponsor a student's exam revision journey. Track impact in real time, send encouraging messages, and help underprivileged students succeed.",
    images: ["https://iexcelo.co/seo/open-graph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default GiveBack;
