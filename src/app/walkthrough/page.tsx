import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";
import Walkthrough from "./Walkthrough";

/* Outside the (index) group and outside /lessons: the body brings its own Breadcrumb
   and PageLayout, the same shell a lesson page has, but it is not one of them. */

const description =
  "A 7-step system design framework: requirements, estimation, API design, data model, high level design, deep dives, and finding bottlenecks.";

export const metadata: Metadata = {
  title: "A 7-Step Walkthrough for Any System Design",
  description,
  alternates: { canonical: "/walkthrough" },
  openGraph: {
    type: "article",
    url: "/walkthrough",
    siteName: SITE_NAME,
    title: `A 7-Step Walkthrough for Any System Design · ${SITE_NAME}`,
    description,
  },
};

export default function WalkthroughPage() {
  return <Walkthrough />;
}
