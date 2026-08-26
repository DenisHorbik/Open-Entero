"use client";

import type { StageId } from "./entero-content";

export type LeadAttribution = {
  landingUrl: string;
  referrer: string;
  initialStage: StageId;
  currentStage: StageId;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  yclid?: string;
  ymclid?: string;
  concept: "A";
  theme: "premium-gold";
  heroVariant: "A1";
};

const STORAGE_KEY = "entero-lead-attribution";

function stageFromUrl(url: URL): StageId {
  const stage = url.searchParams.get("stage");
  return stage === "space" || stage === "project" ? stage : "idea";
}

function optionalParam(url: URL, name: string) {
  return url.searchParams.get(name)?.slice(0, 500) || undefined;
}

export function collectLeadAttribution(currentStage: StageId): LeadAttribution {
  const url = new URL(window.location.href);
  let saved: Partial<LeadAttribution> | null = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as Partial<LeadAttribution> | null;
  } catch {
    // A fresh attribution snapshot is safer than blocking submission.
  }

  const attribution: LeadAttribution = {
    landingUrl: saved?.landingUrl || url.toString(),
    referrer: saved?.referrer ?? document.referrer,
    initialStage: saved?.initialStage || stageFromUrl(url),
    currentStage,
    utmSource: saved?.utmSource || optionalParam(url, "utm_source"),
    utmMedium: saved?.utmMedium || optionalParam(url, "utm_medium"),
    utmCampaign: saved?.utmCampaign || optionalParam(url, "utm_campaign"),
    utmContent: saved?.utmContent || optionalParam(url, "utm_content"),
    utmTerm: saved?.utmTerm || optionalParam(url, "utm_term"),
    gclid: saved?.gclid || optionalParam(url, "gclid"),
    yclid: saved?.yclid || optionalParam(url, "yclid"),
    ymclid: saved?.ymclid || optionalParam(url, "ymclid"),
    concept: "A",
    theme: "premium-gold",
    heroVariant: "A1",
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Attribution remains available for the current request.
  }
  return attribution;
}
