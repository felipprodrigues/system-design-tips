"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  conceptTitleFor,
  isShelfKey,
  SHELVES,
  THEMES,
  type CaseStudy,
  type ShelfKey,
  type Theme,
} from "@/lib/caseStudies";
import styles from "./CaseStudyBrowser.module.css";

/* A chip every study in the shelf carries filters nothing, so it is not offered:
   inside the frontend shelf that is the theme defining the shelf. */
function themesIn(studies: readonly CaseStudy[]) {
  return THEMES.filter((theme) => {
    const count = studies.filter((study) => study.themes.includes(theme)).length;
    return count > 0 && count < studies.length;
  });
}

/* The collection lives in the URL so a shelf can be linked and the back button
   steps between them. The theme within it does not: it is a view of one shelf,
   not a place, and the shelf remounts on every change so it never carries a
   filter from the shelf before it. */
export default function CaseStudyBrowser() {
  const router = useRouter();
  const param = useSearchParams().get("set");
  const key = isShelfKey(param) ? param : null;

  if (!key) {
    return (
      <div className={styles.sets}>
        {(Object.keys(SHELVES) as ShelfKey[]).map((option) => (
          <button
            key={option}
            type="button"
            data-set={option}
            className={styles.set}
            onClick={() => router.push(`/case-studies?set=${option}`, { scroll: false })}
          >
            <span className={styles.setCount}>{SHELVES[option].studies.length} case studies</span>
            <span className={styles.setTitle}>{SHELVES[option].title}</span>
            <span className={styles.setBlurb}>{SHELVES[option].blurb}</span>
            <span className={styles.setGo} aria-hidden="true">
              Browse →
            </span>
          </button>
        ))}
      </div>
    );
  }

  return <Shelf key={key} title={SHELVES[key].title} studies={SHELVES[key].studies} />;
}

/* Filtering is client-side: the whole set is a couple of KB and fits in the page,
   so there is nothing to fetch. */
function Shelf({ title, studies }: { title: string; studies: readonly CaseStudy[] }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const shown = theme ? studies.filter((study) => study.themes.includes(theme)) : studies;

  return (
    <>
      <h2 className={styles.setHeading}>{title}</h2>

      <div className={styles.filters} role="group" aria-label="Filter by theme">
        <button
          type="button"
          onClick={() => setTheme(null)}
          className={styles.chip}
          aria-pressed={theme === null}
        >
          All <span className={styles.count}>{studies.length}</span>
        </button>
        {themesIn(studies).map((t) => {
          const count = studies.filter((s) => s.themes.includes(t)).length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t === theme ? null : t)}
              className={styles.chip}
              aria-pressed={theme === t}
            >
              {t} <span className={styles.count}>{count}</span>
            </button>
          );
        })}
      </div>

      <p className={styles.tally} aria-live="polite">
        {shown.length} {shown.length === 1 ? "case study" : "case studies"}
        {theme ? ` in ${theme}` : ""}
      </p>

      <div className={styles.grid}>
        {shown.map((study) => {
          const conceptTitle = conceptTitleFor(study);
          return (
            <article key={study.url} className={styles.card}>
              <div className={styles.head}>
                <span className={styles.company}>{study.company}</span>
                {study.kind && <span className={styles.kind}>{study.kind}</span>}
              </div>

              <h3 className={styles.title}>
                <a href={study.url} target="_blank" rel="noopener noreferrer">
                  {study.title}
                  <span className={styles.arrow} aria-hidden="true">↗</span>
                </a>
              </h3>

              <p className={styles.takeaway}>{study.takeaway}</p>

              <div className={styles.foot}>
                <div className={styles.tags}>
                  {study.themes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={styles.tag}
                      onClick={() => setTheme(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {conceptTitle && (
                  <Link href={`/concepts/${study.concept}`} className={styles.concept}>
                    {conceptTitle}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
