import type { MetadataRoute } from "next";
import { siteIndexable, siteUrl } from "./seo-config";

export default function robots(): MetadataRoute.Robots {
  if (!siteIndexable) {
    return {
      rules: [
        { userAgent: "*", disallow: "/" },
        { userAgent: "Google-Extended", disallow: "/" },
      ],
    };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
