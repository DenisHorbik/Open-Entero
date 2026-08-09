import type { Metadata } from "next";
import { EnteroPrototype } from "./EnteroPrototype";

export const metadata: Metadata = {
  title: "ENTERO | Открываете ресторан?",
  description:
    "Интерактивный прототип ENTERO для выбора следующего шага в оснащении ресторана.",
};

type StageId = "idea" | "space" | "project";

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
  return <EnteroPrototype initialStage={parseStage(params.stage)} />;
}
