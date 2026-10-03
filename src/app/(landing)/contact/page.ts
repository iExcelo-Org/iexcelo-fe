import type { Metadata } from "next";
import Contact from "./Contact";

export const metadata: Metadata = {
  title: "iExcelo - Contact Us",
  description:
    "Get in touch with iExcelo. Reach our friendly support team by email at platform@iexcelo.com, call us at +234 812 483 2720, or visit our Lagos office. We're here to help Monday to Friday, 8am to 5pm.",
  alternates: { canonical: "https://iexcelo.co/contact" },
  openGraph: {
    type: "website",
    url: "https://iexcelo.co/contact",
    siteName: "iExcelo",
    title: "Contact iExcelo – We'd Love to Hear from You",
    description:
      "Reach iExcelo's support team via email, phone, or visit our Lagos office. We're available Monday to Friday, 8am to 5pm.",
    images: [
      {
        url: "https://iexcelo.co/seo/open-graph.png",
        width: 1200,
        height: 630,
        alt: "iExcelo – Contact Us",
      },
    ],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact iExcelo – We'd Love to Hear from You",
    description:
      "Reach iExcelo's support team via email, phone, or visit our Lagos office. Available Monday to Friday, 8am to 5pm.",
    images: ["https://iexcelo.co/seo/open-graph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default Contact;
