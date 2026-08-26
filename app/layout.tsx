import type { Metadata } from "next";
import { jsonLd, siteIndexable, siteUrl } from "./seo-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ENTERO | Открываете ресторан?",
  description:
    "Проект кухни, подбор и запуск профессионального оборудования для ресторанов и HoReCa в Беларуси.",
  robots: siteIndexable
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ENTERO",
  legalName: "ООО «РЕСТОИМПОРТ»",
  url: siteUrl,
  telephone: "+375445002929",
  email: "info@entero.by",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Макаёнка, 12Г",
    addressLocality: "Минск",
    addressCountry: "BY",
  },
  areaServed: { "@type": "Country", name: "Беларусь" },
  sameAs: ["https://entero.by", "https://t.me/EnteroMinsk"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ENTERO",
  url: siteUrl,
  inLanguage: "ru-BY",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="preload"
          href="/fonts/cormorant-garamond-cyrillic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
