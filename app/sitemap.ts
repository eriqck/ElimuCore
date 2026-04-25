import type { MetadataRoute } from "next";
import { fallbackResources } from "@/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${baseUrl}/resources`,
      changeFrequency: "daily",
      priority: 0.9
    },
    ...fallbackResources.map((resource) => ({
      url: `${baseUrl}/resources/${resource.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];
}
