export const siteUrl = "https://open.entero.by";

export const siteIndexable = process.env.SITE_INDEXABLE === "true";

export const reviewedDate = "2026-08-26";

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
