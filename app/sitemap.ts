import type { MetadataRoute } from "next";
import { reviewedDate, siteIndexable, siteUrl } from "./seo-config";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteIndexable) return [];

  return [
    {
      url: siteUrl,
      lastModified: reviewedDate,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: reviewedDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
