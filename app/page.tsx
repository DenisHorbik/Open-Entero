import type { Metadata } from "next";
import { EnteroPrototype } from "./EnteroPrototype";
import type { StageId } from "./entero-content";
import { siteUrl } from "./seo-config";

export const metadata: Metadata = {
  title: "ENTERO | Открываете ресторан?",
  description:
    "Интерактивный прототип ENTERO для выбора следующего шага в оснащении ресторана.",
  alternates: { canonical: siteUrl },
};

function parseStage(value: string | string[] | undefined): StageId {
  const stage = Array.isArray(value) ? value[0] : value;
  return stage === "space" || stage === "project" ? stage : "idea";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const form = Array.isArray(params.form) ? params.form[0] : params.form;
  return <EnteroPrototype initialStage={parseStage(params.stage)} initialFormOpen={form === "contact"} />;
}
