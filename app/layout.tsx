/* eslint-disable @next/next/next-script-for-ga -- The supplied GTM container uses Google's standard head + noscript installation. */
import type { Metadata } from "next";
import { jsonLd, siteIndexable, siteUrl } from "./seo-config";
import { publicSiteConfig } from "./public-site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ENTERO | Открываете ресторан?",
  description:
    "Проект кухни, подбор и запуск профессионального оборудования для ресторанов и HoReCa в Беларуси.",
  robots: siteIndexable
    ? { index: true, follow: true }
    : { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
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
        <script
          id="google-tag-manager"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${publicSiteConfig.gtmContainerId}');`,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${publicSiteConfig.gtmContainerId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
