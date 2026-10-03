import type { Metadata } from "next";
import FAQs from "./FAQs";

export const metadata: Metadata = {
  title: "iExcelo - FAQs",
  description:
    "Find answers to the most common questions about iExcelo. Learn how our exam revision platform works, what subscriptions are available, how the GiveBack and Affiliate programs operate, and how to get the most out of WAEC, JAMB, NECO and SAT preparation.",
  alternates: { canonical: "https://iexcelo.co/faqs" },
  openGraph: {
    type: "website",
    url: "https://iexcelo.co/faqs",
    siteName: "iExcelo",
    title: "iExcelo FAQs – Everything You Need to Know",
    description:
      "Got questions about iExcelo? Browse our FAQs covering subscriptions, exam revision tools, the GiveBack program, Affiliate program, account setup, and more.",
    images: [
      {
        url: "https://iexcelo.co/seo/open-graph.png",
        width: 1200,
        height: 630,
        alt: "iExcelo – FAQs",
      },
    ],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "iExcelo FAQs – Everything You Need to Know",
    description:
      "Find answers about iExcelo subscriptions, exam revision features, GiveBack, Affiliate programs, and account management.",
    images: ["https://iexcelo.co/seo/open-graph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default FAQs;
