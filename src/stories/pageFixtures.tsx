import type { ComponentType } from "react";
import { deeper } from "@/app/frontend/data";
import type { Deeper } from "@/app/frontend/FrontendDesign";
import { findings, type FindingLinks } from "@/app/linkedin-skills/data";
import { Breadcrumb, PageNav } from "@/components";
import ConceptLayout from "@/components/Concept/ConceptLayout";
import ConceptRail from "@/components/Concept/ConceptRail";
import type { ConceptSlugProps } from "@/components/Concept/types";
import html from "@/content/interview-qa.html?raw";
import { bySlug, getConceptNav, reading } from "@/lib/concepts";
import { parseSections } from "@/lib/interviewPrep";
import { latestRelease } from "@/lib/releases";

/* Mirrors the props frontend/page.tsx and linkedin-skills/page.tsx build with
   node:fs, which a browser cannot run. Change them together. */
export const prepSections = parseSections(html);

const byNumber = new Map(prepSections.map((section) => [Number(section.id.slice(1)), section]));

function question(id: number) {
  const section = byNumber.get(id);
  return section ? [{ id: section.id, title: section.title, topic: section.topic }] : [];
}

export const frontendDeeper: Deeper[] = deeper.flatMap(({ n, ids }) => {
  const questions = ids.flatMap(question);
  return questions.length === 0 ? [] : [{ n, questions }];
});

export const linkedInDeeper: FindingLinks = Object.fromEntries(
  findings.map((finding) => [finding.n, finding.qa.flatMap(question)]),
);

export const announcementSeen = { [`sd-announced:${latestRelease.href}`]: "1" };

export const CONCEPT_SLUGS = reading.map(({ concept }) => concept.slug);

export async function loadConcept(slug: string): Promise<ComponentType> {
  return (await import(`../concepts/${slug}.tsx`)).default;
}

export interface ConceptPageProps extends ConceptSlugProps {
  Body: ComponentType;
}

export function ConceptPage({ slug, Body }: ConceptPageProps) {
  const nav = getConceptNav(slug);
  const { concept } = bySlug.get(slug)!;
  return (
    <>
      <Breadcrumb section={nav.sectionTitle} concept={concept.title} />
      <ConceptLayout rail={<ConceptRail slug={slug} />}>
        <Body />
      </ConceptLayout>
      <PageNav {...nav} label={concept.label} />
    </>
  );
}
