import type { Metadata } from "next";
import Affiliate from "./Affiliate";

export const metadata: Metadata = {
  title: "iExcelo - Affiliate Program",
  description:
    "Earn up to 15% commission with iExcelo's Affiliate Program. Share your unique referral link, track sign-ups and commissions in real time, and help students across Nigeria and West Africa unlock their full academic potential.",
  alternates: { canonical: "https://iexcelo.co/affiliate" },
  openGraph: {
    type: "website",
    url: "https://iexcelo.co/affiliate",
    siteName: "iExcelo",
    title: "iExcelo Affiliate Program – Earn While Empowering Education",
    description:
      "Turn your network into impact and income. Earn up to 15% commission for every student who subscribes through your referral link. Real-time tracking, easy payouts.",
    images: [
      {
        url: "https://iexcelo.co/seo/open-graph.png",
        width: 1200,
        height: 630,
        alt: "iExcelo – Affiliate Program",
      },
    ],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "iExcelo Affiliate Program – Earn While Empowering Education",
    description:
      "Earn up to 15% commission for every student you refer to iExcelo. Share your link, track earnings in real time, and request payouts easily.",
    images: ["https://iexcelo.co/seo/open-graph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default Affiliate;
