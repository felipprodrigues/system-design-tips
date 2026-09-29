import type { MetadataRoute } from "next";
import { groups } from "@/lib/lessons";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...groups.flatMap((group) =>
      group.lessons.map((lesson) => ({
        url: `${SITE_URL}/lessons/${lesson.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ),
  ];
}
