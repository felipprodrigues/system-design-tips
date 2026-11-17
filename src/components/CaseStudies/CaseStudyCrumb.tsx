"use client";

import { useSearchParams } from "next/navigation";
import { isShelfKey, SHELVES } from "@/lib/caseStudies";
import Breadcrumb from "../Layout/Breadcrumb";

/* Its own island above the page column, because the trail has to sit flush under
   the navbar like every other page's while the shelf it names is only known from
   the URL on the client. */
export default function CaseStudyCrumb() {
  const param = useSearchParams().get("set");

  return isShelfKey(param) ? (
    <Breadcrumb section="Case studies" sectionHref="/case-studies" concept={SHELVES[param].title} />
  ) : (
    <Breadcrumb section="Case studies" concept="System blueprints" />
  );
}
