import type { MetadataRoute } from "next";
import { getLearningClasses } from "@/lib/learning";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const learningClasses = await getLearningClasses();
  const availableClasses = learningClasses.filter((item) => item.available);

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/classes`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/scheme-bot`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8
    },
    ...learningClasses.map((learningClass) => ({
      url: `${siteUrl}/classes/${learningClass.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    ...availableClasses.flatMap((learningClass) =>
      learningClass.topics.map((topic) => ({
        url: `${siteUrl}/classes/${learningClass.slug}/${topic.slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7
      }))
    )
  ];
}
