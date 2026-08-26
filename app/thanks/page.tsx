import type { Metadata } from "next";
import type { StageId } from "../entero-content";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "../SiteHeader";
import { ThankYouClient } from "./ThankYouClient";

export const metadata: Metadata = {
  title: "Спасибо | ENTERO",
  description: "Запрос на подбор профессионального оборудования ENTERO.",
};

function parseStage(value: string | string[] | undefined): StageId {
  const stage = Array.isArray(value) ? value[0] : value;
  return stage === "space" || stage === "project" ? stage : "idea";
}

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <main className="site-shell thanks-page">
      <SiteHeader wordmarkHref="/" />
      <ThankYouClient stage={parseStage(params.stage)} />
      <SiteFooter />
    </main>
  );
}
