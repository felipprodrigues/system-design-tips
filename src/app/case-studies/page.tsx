import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumb, CaseStudyBrowser, CaseStudyCrumb, Hero } from "@/components";
import { SITE_NAME } from "@/lib/seo";
import styles from "./page.module.css";

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
      {/* The shelf is only readable on the client, so the prerendered HTML carries
          the trail without it rather than a gap that fills in at hydration. */}
      <Suspense fallback={<Breadcrumb section="Case studies" concept="System blueprints" />}>
        <CaseStudyCrumb />
      </Suspense>

      <div className={styles.page}>
        <div className={styles.inner}>
          <Hero eyebrow="Case Studies" title="System blueprints">
            The same trade-offs the concepts cover, met by real teams at real scale. Two shelves:
            postmortems where it went wrong and write-ups where it went right, and frontend
            rebuilds where the thing under pressure was the interface itself. Pick one, filter by
            theme, and follow the concept link to the page behind it.
          </Hero>

          <Suspense>
            <CaseStudyBrowser />
          </Suspense>
        </div>
      </div>
    </>
  );
}
