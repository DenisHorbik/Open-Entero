import type { Metadata } from "next";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "../SiteHeader";
import { ThankYouClient } from "./ThankYouClient";

export const metadata: Metadata = {
  title: "Спасибо | ENTERO",
  description: "Запрос на подбор профессионального оборудования ENTERO.",
};

export default function ThanksPage() {
  return (
    <main className="site-shell thanks-page">
      <SiteHeader wordmarkHref="/" />
      <ThankYouClient />
      <SiteFooter />
    </main>
  );
}
