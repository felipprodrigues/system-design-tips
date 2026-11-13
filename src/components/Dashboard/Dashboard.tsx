"use client";

import Link from "next/link";
import { STATUS_LABEL, toggleCollapsed, useCollapsed } from "@/lib/progress";
import { formatMinutes, useRoadmap } from "@/lib/roadmap";
import ProgressRing from "./ProgressRing";
import SectionCard from "./SectionCard";
import styles from "./Dashboard.module.css";

/* Client-side because every number here comes from localStorage. Before hydration
   the roadmap reads as untouched, which is also exactly what a first-time visitor
   sees, so the prerendered HTML is correct rather than a placeholder. */
/* A tick rather than a "Completed" pill: this line is a footnote under the next
   concept, and a badge there pulled the eye away from the thing to read next. */
function Check() {
  return (
    <svg viewBox="0 0 16 16" className={styles.check} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Completed" role="img">
      <path d="m3 8.5 3.2 3.2L13 5" />
    </svg>
  );
}

/* The server snapshot is an empty list, so the prerendered HTML has every section
   open and a stored fold lands at hydration.

   onToggle rather than onClick: it fires for the keyboard and for the native
   summary activation alike. `id` is the storage key, not the heading, so renaming
   a heading does not strand a fold under the old name. */
function Feature({ id, title, children }: { id: string; title: React.ReactNode; children: React.ReactNode }) {
  const folded = useCollapsed().includes(id);

  return (
    <details
      className={styles.feature}
      open={!folded}
      onToggle={(event) => {
        if (event.currentTarget.open === folded) toggleCollapsed(id);
      }}
    >
      <summary className={styles.featureLabel}>
        <svg viewBox="0 0 16 16" className={styles.chevron} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
        {title}
        <span className={styles.featureRule} aria-hidden="true" />
      </summary>
      {children}
    </details>
  );
}

/* The group the roadmap builds up to. Pulled out of the collapsible list: it holds a
   single page, so a section that can hide it hides the whole thing. */
const CAPSTONE = "System Design 101";

export default function Dashboard({ questionCount }: { questionCount: number }) {
  const roadmap = useRoadmap();
  const started = roadmap.done > 0 || roadmap.lastVisited !== undefined;
  const capstone = roadmap.sections.find((section) => section.title === CAPSTONE);
  const sections = roadmap.sections.filter((section) => section !== capstone);

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
            <ProgressRing percent={roadmap.library.percent} label={`${roadmap.library.percent}%`} />
            <div>
              {roadmap.next ? (
                <>
                  <p className={styles.cardHint}>{started ? "Continue" : "Start with"}</p>
                  <p className={styles.cardValue}>{roadmap.next.concept.title}</p>
                  <Link href={`/concepts/${roadmap.next.concept.slug}`} className={styles.button}>
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
            {roadmap.library.done} of {roadmap.library.total} pages &middot;{" "}
            {roadmap.done} of {roadmap.library.concepts} concepts
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
                    <Check />
                    <span className={styles.cardMetaTitle}>{roadmap.lastVisited.concept.title}</span>
                  </p>
                  <p className={styles.cardHint}>Next</p>
                  <p className={styles.cardValue}>{roadmap.next.concept.title}</p>
                  <Link href={`/concepts/${roadmap.next.concept.slug}`} className={styles.button}>
                    Open next
                  </Link>
                </>
              ) : (
                <>
                  <p className={styles.cardValue}>{roadmap.lastVisited.concept.title}</p>
                  {roadmap.lastVisited.status === "done" ? (
                    <p className={styles.cardHint}>
                      <Check /> Completed, and it was the last one. More ship regularly.
                    </p>
                  ) : (
                    <>
                      <p className={styles.cardHint}>{roadmap.lastVisited.concept.minutes} min read</p>
                      <Link href={`/concepts/${roadmap.lastVisited.concept.slug}`} className={styles.button}>
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
                Concepts you open are remembered in this browser, no account needed.
              </p>
            </>
          )}
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Library</p>
          <dl className={styles.figures}>
            <div>
              <dt>Concepts</dt>
              <dd>{roadmap.library.concepts}</dd>
            </div>
            <div>
              <dt>Guides &amp; Q&amp;A</dt>
              <dd>{roadmap.library.pages}</dd>
            </div>
            <div>
              <dt>Total read time</dt>
              <dd>{formatMinutes(roadmap.library.totalMinutes)}</dd>
            </div>
            <div>
              <dt>Left to read</dt>
              <dd>{formatMinutes(roadmap.library.remainingMinutes)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <Feature id="concepts" title="System Design Concepts">
        <div className={styles.sections}>
          {sections.map((section) => (
            <SectionCard key={section.title} section={section} open={section.done < section.total} />
          ))}
        </div>
      </Feature>

      {/* Its own titled rule, like every other block here — without one this pair
          runs straight into the capstones and reads as part of that section. */}
      <Feature id="apply" title="Apply It">
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
          </Link>
        </div>
      </Feature>
      {capstone && (
        <Feature id="capstone" title={capstone.title}>
          <div className={styles.banners}>
            {capstone.concepts.map(({ concept, status }) => (
              <Link
                key={concept.slug}
                href={`/concepts/${concept.slug}`}
                className={styles.banner}
                data-tone="capstone"
              >
                <span className={styles.bannerIcon} aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
                    <path d="M3.5 16.5h13" />
                    <rect x="4" y="11" width="3.2" height="4" rx="0.6" />
                    <rect x="8.4" y="7.5" width="3.2" height="7.5" rx="0.6" />
                    <rect x="12.8" y="4" width="3.2" height="11" rx="0.6" />
                  </svg>
                </span>
                <span className={styles.bannerBody}>
                  <span className={styles.bannerEyebrow}>{concept.label ?? capstone.title}</span>
                  <span className={styles.bannerTitle}>{concept.title}</span>
                  <span className={styles.bannerSub}>{concept.description}</span>
                </span>
                {/* Not aria-hidden like the grid's badge: here the link keeps its own
                    visible label, so the status can just be read out alongside it. */}
                {status !== "todo" && (
                  <span className={styles.badge} data-status={status}>
                    {STATUS_LABEL[status]}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </Feature>
      )}


      <Feature id="frontend" title="Frontend System Design 101">
        <div className={styles.banners}>
          <Link href="/frontend" className={styles.banner} data-tone="frontend">
            <span className={styles.bannerIcon} aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
                <rect x="2.5" y="4" width="15" height="12" rx="1.2" />
                <path d="M2.5 7.5h15" />
                <path d="M7 11h4" />
                <path d="M7 13.5h6" />
              </svg>
            </span>
            <span className={styles.bannerBody}>
              <span className={styles.bannerEyebrow}>The map</span>
              <span className={styles.bannerTitle}>A 9-step walkthrough to Frontend System Design</span>
              <span className={styles.bannerSub}>
                Nine stages, one stack, and a decision list per stage. Rendering strategy, state
                ownership, the eight UI states, the reconnect path &mdash; each a concept&rsquo;s worth
                of material on its own, and this is the order to meet them in.
              </span>
            </span>
            <span className={styles.badge} data-kind="frontend">
              Frontend
            </span>
          </Link>

          <Link href="/linkedin-skills" className={styles.banner} data-tone="frontend">
            <span className={styles.bannerIcon} aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
                <rect x="2.5" y="3.5" width="15" height="3.5" rx="1" />
                <rect x="2.5" y="8.25" width="15" height="3.5" rx="1" />
                <path d="M2.5 14.5h8.5" strokeDasharray="2 2" />
                <path d="M13.5 13.2 16.5 16.2M16.5 13.2l-3 3" />
              </svg>
            </span>
            <span className={styles.bannerBody}>
              <span className={styles.bannerEyebrow}>Case study</span>
              <span className={styles.bannerTitle}>LinkedIn Skills: My Own Experience</span>
              <span className={styles.bannerSub}>
                Four things I noticed while updating my own profile skills: pagination that
                stopped after a delete, a filtered view that kept a deleted row, an order
                endorsements did not explain, and the tests that would have caught each one.
              </span>
            </span>
            <span className={styles.badge} data-kind="frontend">
              Frontend
            </span>
          </Link>
        </div>
      </Feature>

      <Feature id="interview-qa" title={<>Interview Q&amp;A</>}>
        <Link href="/interview-qa" className={styles.banner} data-tone="prep">
          <span className={styles.bannerIcon} aria-hidden="true">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <path d="M4 4.5h12a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H9l-3.4 2.8v-2.8H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" />
              <path d="M8.5 7.9a1.6 1.6 0 1 1 1.9 1.9v.9" />
              <path d="M10.4 12.1h.01" />
            </svg>
          </span>
          <span className={styles.bannerBody}>
            {/* The divider above already names the section, so the eyebrow counts. */}
            <span className={styles.bannerEyebrow}>{questionCount} questions</span>
            <span className={styles.bannerTitle}>Questions, answered</span>
            <span className={styles.bannerSub}>
              JavaScript, React, performance and the browser — each one answered the way you
              would say it in the room.
            </span>
          </span>
          {/* Everything else on this page is system design; this one is not. */}
          <span className={styles.badge} data-kind="frontend">
            Frontend
          </span>
        </Link>
      </Feature>
    </>
  );
}
