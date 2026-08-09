import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ENTERO | Открываете ресторан?",
  description:
    "Визуальный прототип ENTERO: профессиональное оснащение HoReCa по этапу открытия.",
  robots: { index: false, follow: false },
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
      </head>
      <body>{children}</body>
    </html>
  );
}
