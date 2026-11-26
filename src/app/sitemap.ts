import type { MetadataRoute } from "next";
import { groups } from "@/lib/concepts";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/case-studies`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/walkthrough`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/frontend`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/linkedin-skills`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/interview-qa`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/interview-qa/call-apply-bind`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/closures`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/deep-vs-shallow-copy`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/event-loop`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/set`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/map`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/weakmap`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/weakset`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/pass-by-value`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/reference-equality`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/promise-methods`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/create-objects`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/property-descriptors`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/generators`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview-qa/prototypal-inheritance`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.5 },
    ...groups.flatMap((group) =>
      group.concepts.map((concept) => ({
        url: `${SITE_URL}/concepts/${concept.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ),
  ];
}
