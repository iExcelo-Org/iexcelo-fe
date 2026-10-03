import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout, UtilsProvider } from "@/components/organisms";
import { BASE_URL, SITE_NAME } from "@/lib/seo";
import { geistSans } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} – Revise Smarter, Excel in Every Exam`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "iExcelo is Nigeria's #1 exam revision platform. Access thousands of past questions with expert explanations for WAEC, JAMB, NECO & SAT. Join the GiveBack and Affiliate programs.",
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  authors: [{ name: "iExcelo", url: BASE_URL }],
  generator: "Next.js",
  creator: "iExcelo",
  publisher: "iExcelo",
};

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "iExcelo",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/seo/logo.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+234-812-483-2720",
        contactType: "customer support",
        email: "platform@iexcelo.com",
        areaServed: "NG",
        availableLanguage: "English",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "16B Babalola street, Mushin-Itire Road, Ilasamaja",
        addressLocality: "Lagos",
        addressCountry: "NG",
      },
      sameAs: [
        "https://www.facebook.com/profile.php?id=61572819621643",
        "https://x.com/iExcelo1",
        "https://www.instagram.com/iexceloofficial",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "iExcelo",
      description:
        "Nigeria's #1 exam revision platform for WAEC, JAMB, NECO & SAT",
      publisher: { "@id": `${BASE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${BASE_URL}/#educational-org`,
      name: "iExcelo",
      url: BASE_URL,
      description:
        "An online educational platform helping Nigerian students excel in WAEC, JAMB, NECO and SAT through smart exam revision tools.",
      areaServed: ["Nigeria", "West Africa"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Exam Revision Subscriptions",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/seo/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
      </head>
      <body
        className={`${geistSans.className} antialiased`}
        suppressHydrationWarning
      >
        <main>
          <UtilsProvider />
          <ClientLayout>{children}</ClientLayout>
        </main>
      </body>
    </html>
  );
}
