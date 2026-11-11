import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";
import FrontendDesign from "./FrontendDesign";

/* Sibling to /walkthrough: same chrome as a concept page, but not one of them, so
   it brings its own Breadcrumb and PageLayout and stays out of /concepts. */

const description =
  "A nine stage order for frontend system design: framing, the server/client boundary, the client stack, data ownership, UI states, the network, the performance budget, resilience, and the trust boundary.";

export const metadata: Metadata = {
  title: "A 9-step walkthrough to Frontend System Design",
  description,
  alternates: { canonical: "/frontend" },
  openGraph: {
    type: "article",
    url: "/frontend",
    siteName: SITE_NAME,
    title: `A 9-step walkthrough to Frontend System Design · ${SITE_NAME}`,
    description,
  },
};

export default function FrontendDesignPage() {
  return <FrontendDesign />;
}
