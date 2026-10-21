import type { MetadataRoute } from "next";
import { groups } from "@/lib/concepts";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/case-studies`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/walkthrough`, changeFrequency: "monthly", priority: 0.9 },
    ...groups.flatMap((group) =>
      group.concepts.map((concept) => ({
        url: `${SITE_URL}/concepts/${concept.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ),
  ];
}
