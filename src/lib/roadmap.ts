"use client";

import { groups, reading, type ConceptEntry } from "./concepts";
import { pageMinutes, pages } from "./content";
import { statusOf, useLearned, useVisited, type Status } from "./progress";

export interface ConceptProgress {
  concept: ConceptEntry;
  status: Status;
}

export interface GroupProgress {
  title: string;
  concepts: ConceptProgress[];
  done: number;
  total: number;
  /** 0-100, for the section's progress bar. */
  percent: number;
}

/* Kept apart from the concept figures above, which still drive the section bars
   and the reading order Resume follows. */
export interface Library {
  concepts: number;
  pages: number;
  total: number;
  done: number;
  percent: number;
  totalMinutes: number;
  remainingMinutes: number;
}

export interface Roadmap {
  sections: GroupProgress[];
  done: number;
  total: number;
  percent: number;
  /** Read time across every concept, and across the ones not yet done. */
  totalMinutes: number;
  remainingMinutes: number;
  library: Library;
  /** Where "Resume" goes: the concept in progress, else the first unread one. */
  next?: ConceptProgress;
  /** Tail of the visited list, which is the most recently opened concept. Carries
      its status, because a finished one is a prompt to move on rather than reopen. */
  lastVisited?: ConceptProgress;
}

/** The whole derivation, as a plain function of the two slug lists — no React, so it
    can be exercised directly. `useRoadmap` is the hook that feeds it live storage. */
export function deriveRoadmap(learned: readonly string[], seen: readonly string[]): Roadmap {
  const sections = groups.map((group) => {
    const concepts = group.concepts.map((concept) => ({
      concept,
      status: statusOf(concept.slug, learned, seen),
    }));
    const done = concepts.filter((c) => c.status === "done").length;
    return {
      title: group.title,
      concepts,
      done,
      total: concepts.length,
      percent: concepts.length ? Math.round((done / concepts.length) * 100) : 0,
    };
  });

  const all = sections.flatMap((section) => section.concepts);
  const done = all.filter((c) => c.status === "done").length;

  /* Reading order, not group order, so Resume follows the same path prev/next does. */
  const inOrder = reading.map(({ concept }) => all.find((c) => c.concept.slug === concept.slug)!);
  const next = inOrder.find((c) => c.status === "doing") ?? inOrder.find((c) => c.status === "todo");

  const conceptMinutes = all.reduce((sum, c) => sum + c.concept.minutes, 0);
  const conceptsLeft = all.filter((c) => c.status !== "done");
  const pagesRead = pages.filter((page) => statusOf(page.slug, learned, seen) === "done");
  const pagesLeft = pages.filter((page) => statusOf(page.slug, learned, seen) !== "done");
  const libraryDone = done + pagesRead.length;
  const libraryTotal = all.length + pages.length;
  const sumPages = (list: typeof pages) =>
    list.reduce((sum, page) => sum + pageMinutes(page.slug), 0);

  return {
    sections,
    done,
    total: all.length,
    percent: all.length ? Math.round((done / all.length) * 100) : 0,
    totalMinutes: conceptMinutes,
    remainingMinutes: conceptsLeft.reduce((sum, c) => sum + c.concept.minutes, 0),
    library: {
      concepts: all.length,
      pages: pages.length,
      total: libraryTotal,
      done: libraryDone,
      percent: libraryTotal ? Math.round((libraryDone / libraryTotal) * 100) : 0,
      totalMinutes: conceptMinutes + sumPages(pages),
      remainingMinutes:
        conceptsLeft.reduce((sum, c) => sum + c.concept.minutes, 0) + sumPages(pagesLeft),
    },
    next,
    lastVisited: all.find((c) => c.concept.slug === seen[seen.length - 1]),
  };
}

/** Everything the dashboard renders. Before hydration both lists are empty, so this
    returns an untouched roadmap and the server and client markup agree. */
export function useRoadmap(): Roadmap {
  return deriveRoadmap(useLearned(), useVisited());
}

/** "3h 15m" / "45m" — minutes are never shown past an hour. */
export function formatMinutes(total: number): string {
  if (total < 60) return `${total}m`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}
