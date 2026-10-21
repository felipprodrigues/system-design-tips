import type { Metadata } from "next";
import { CaseStudyBrowser, Hero } from "@/components";
import { SITE_NAME } from "@/lib/seo";

const description =
  "Real system design case studies: outages, postmortems and engineering write-ups from Stripe, Netflix, Discord, Cloudflare, GitHub and others, filtered by theme.";

export const metadata: Metadata = {
  title: "Real-world case studies",
  description,
  alternates: { canonical: "/case-studies" },
  openGraph: {
    type: "website",
    url: "/case-studies",
    siteName: SITE_NAME,
    title: `Real-world case studies · ${SITE_NAME}`,
    description,
  },
};

export default function CaseStudiesPage() {
  return (
    <>
      <Hero eyebrow="Case Studies" title="System blueprints">
        The same trade-offs the concepts cover, met by real teams at real scale. Postmortems
        where it went wrong, write-ups where it went right. Filter by theme, and follow the
        concept link to the page behind it.
      </Hero>

      <CaseStudyBrowser />
    </>
  );
}
