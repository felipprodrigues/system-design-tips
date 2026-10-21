"use client";

import Link from "next/link";
import { formatMinutes, useRoadmap } from "@/lib/roadmap";
import ProgressRing from "./ProgressRing";
import SectionCard from "./SectionCard";
import styles from "./Dashboard.module.css";

/* Client-side because every number here comes from localStorage. Before hydration
   the roadmap reads as untouched, which is also exactly what a first-time visitor
   sees, so the prerendered HTML is correct rather than a placeholder. */
export default function Dashboard() {
  const roadmap = useRoadmap();
  const started = roadmap.done > 0 || roadmap.lastVisited !== undefined;

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Roadmap</h1>
        <p className={styles.pageSub}>
          Every concept in the order it makes sense to meet it, from a single request to
          a system that serves millions.
        </p>
      </header>

      <div className={styles.stats}>
        <div className={`${styles.card} ${styles.progressCard}`}>
          <p className={styles.cardLabel}>Your progress</p>
          <div className={styles.progressBody}>
            <ProgressRing percent={roadmap.percent} label={`${roadmap.percent}%`} />
            <div>
              {roadmap.next ? (
                <>
                  <p className={styles.cardHint}>{started ? "Continue" : "Start with"}</p>
                  <p className={styles.cardValue}>{roadmap.next.lesson.title}</p>
                  <Link href={`/concepts/${roadmap.next.lesson.slug}`} className={styles.button}>
                    {started ? "Resume" : "Begin"}
                  </Link>
                </>
              ) : (
                <>
                  <p className={styles.cardHint}>All done</p>
                  <p className={styles.cardValue}>
                    You&rsquo;ve read every concept here. More ship regularly.
                  </p>
                </>
              )}
            </div>
          </div>
          <p className={styles.cardFoot}>
            {roadmap.done} of {roadmap.total} concepts
          </p>
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Last opened</p>
          {roadmap.lastVisited ? (
            <>
              {roadmap.lastVisited.status === "done" && roadmap.next ? (
                /* Finished, so reopening it is the least useful thing on offer. The
                   concept just read drops to a footnote and the next one takes the
                   card's headline. */
                <>
                  <p className={styles.cardMeta}>
                    <span className={styles.badge} data-status="done">Completed</span>
                    <span className={styles.cardMetaTitle}>{roadmap.lastVisited.lesson.title}</span>
                  </p>
                  <p className={styles.cardHint}>Next</p>
                  <p className={styles.cardValue}>{roadmap.next.lesson.title}</p>
                  <Link href={`/concepts/${roadmap.next.lesson.slug}`} className={styles.button}>
                    Open next
                  </Link>
                </>
              ) : (
                <>
                  <p className={styles.cardValue}>{roadmap.lastVisited.lesson.title}</p>
                  {roadmap.lastVisited.status === "done" ? (
                    <>
                      <p>
                        <span className={styles.badge} data-status="done">Completed</span>
                      </p>
                      <p className={styles.cardHint}>
                        That was the last one. More ship regularly.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={styles.cardHint}>{roadmap.lastVisited.lesson.minutes} min read</p>
                      <Link href={`/concepts/${roadmap.lastVisited.lesson.slug}`} className={styles.button}>
                        Open
                      </Link>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <p className={styles.cardValue}>Nothing yet</p>
              <p className={styles.cardHint}>
                Concepts you open are remembered in this browser. No account, nothing sent
                anywhere.
              </p>
            </>
          )}
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Library</p>
          <dl className={styles.figures}>
            <div>
              <dt>Concepts</dt>
              <dd>{roadmap.total}</dd>
            </div>
            <div>
              <dt>Total read time</dt>
              <dd>{formatMinutes(roadmap.totalMinutes)}</dd>
            </div>
            <div>
              <dt>Left to read</dt>
              <dd>{formatMinutes(roadmap.remainingMinutes)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className={styles.sections}>
        {roadmap.sections.map((section) => (
          <SectionCard key={section.title} section={section} open={section.done < section.total} />
        ))}
      </div>

      <div className={styles.banners}>
        <Link href="/walkthrough" className={styles.banner} data-tone="method">
          <span className={styles.bannerIcon} aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
              <circle cx="10" cy="10" r="7.5" />
              <path d="m13.2 6.8-2.1 4.3-4.3 2.1 2.1-4.3 4.3-2.1Z" />
            </svg>
          </span>
          <span>
            <span className={styles.bannerEyebrow}>The Method</span>
            <span className={styles.bannerTitle}>A 7-step walkthrough</span>
            <span className={styles.bannerSub}>
              The order to work in when you&rsquo;re handed a blank page and a vague problem.
            </span>
          </span>
          <span className={styles.bannerArrow} aria-hidden="true">→</span>
        </Link>

        <Link href="/case-studies" className={styles.banner} data-tone="cases">
          <span className={styles.bannerIcon} aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
              <rect x="3" y="4.5" width="14" height="4" rx="1" />
              <path d="M4.5 8.5v6a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-6" />
              <path d="M8.5 11.5h3" />
            </svg>
          </span>
          <span>
            <span className={styles.bannerEyebrow}>Case studies</span>
            <span className={styles.bannerTitle}>System blueprints</span>
            <span className={styles.bannerSub}>
              The same trade-offs, met by real teams at real scale.
            </span>
          </span>
          <span className={styles.bannerArrow} aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  );
}
