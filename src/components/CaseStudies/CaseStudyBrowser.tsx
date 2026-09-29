"use client";

import { useState } from "react";
import Link from "next/link";
import { caseStudies, lessonTitleFor, THEMES, type Theme } from "@/lib/caseStudies";
import styles from "./CaseStudyBrowser.module.css";

/* Filtering is client-side: the whole set is a couple of KB and fits in the page,
   so there is nothing to fetch and no URL state to keep in sync. */
export default function CaseStudyBrowser() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const shown = theme ? caseStudies.filter((s) => s.themes.includes(theme)) : caseStudies;

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Filter by theme">
        <button
          type="button"
          onClick={() => setTheme(null)}
          className={styles.chip}
          aria-pressed={theme === null}
        >
          All <span className={styles.count}>{caseStudies.length}</span>
        </button>
        {THEMES.map((t) => {
          const count = caseStudies.filter((s) => s.themes.includes(t)).length;
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
          const lessonTitle = lessonTitleFor(study);
          return (
            <article key={study.url} className={styles.card}>
              <div className={styles.head}>
                <span className={styles.company}>{study.company}</span>
                {study.kind && <span className={styles.kind}>{study.kind}</span>}
              </div>

              <h2 className={styles.title}>
                <a href={study.url} target="_blank" rel="noopener noreferrer">
                  {study.title}
                  <span className={styles.arrow} aria-hidden="true">↗</span>
                </a>
              </h2>

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
                {lessonTitle && (
                  <Link href={`/lessons/${study.lesson}`} className={styles.lesson}>
                    {lessonTitle}
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
