import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ScrollReveal from "@/components/ScrollReveal";
import { company } from "@/data/site";
import { siteUrl } from "@/lib/site-url";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.name} — ${company.tagline}`,
    template: `%s | ${company.shortName}`,
  },
  description:
    "Aziki Medical Systems Ltd supplies, installs and services medical imaging, laboratory and diagnostic equipment across Nigeria and Africa — ultrasound, X-ray, CT, MRI, laboratory analysers and complete hospital turnkey projects.",
  keywords: [
    "medical equipment Nigeria",
    "ultrasound machines Abuja",
    "X-ray machine supplier Nigeria",
    "CT scanner Nigeria",
    "MRI Nigeria",
    "hospital turnkey projects",
    "medical equipment maintenance",
    "Aziki Medical Systems",
  ],
  openGraph: {
    type: "website",
    siteName: company.name,
    title: `${company.name} — ${company.tagline}`,
    description:
      "Specialist medical electronics engineers since 1999. Sales, installation, maintenance and training for medical imaging, laboratory and diagnostic equipment across Africa.",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organisationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: siteUrl,
    slogan: company.tagline,
    foundingDate: String(company.founded),
    email: company.emails[0],
    telephone: company.phones[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.line1,
      addressLocality: "Abuja",
      addressRegion: "Federal Capital Territory",
      addressCountry: "NG",
    },
    areaServed: "Nigeria",
  };

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-indigo-600 focus:px-5 focus:py-2.5 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <ScrollReveal />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
        />
      </body>
    </html>
  );
}
