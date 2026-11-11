"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Dialog } from "@base-ui/react/dialog";
import { TOPICS, type PrepSection, type Topic } from "@/lib/interviewPrep";
import { toggleSaved, useSaved } from "@/lib/progress";
import { setUrlState, useUrlState } from "@/lib/urlState";
import styles from "./PrepBrowser.module.css";

/* A view-transition-name has to be a bare identifier, and topics have spaces and
   an ampersand in them. */
const vt = (topic: Topic) => `prep-${topic.toLowerCase().replace(/[^a-z]+/g, "-")}`;

/** Where the one cross-reference bubble sits, in viewport coordinates. */
interface Tip {
  text: string;
  x: number;
  y: number;
  above: boolean;
}

/* Starred, or not. Empty on the server and on the first paint, since the list
   only exists in the browser — the star fills in once localStorage is read. */
function Star({ section, on }: { section: PrepSection; on: boolean }) {
  return (
    <button
      type="button"
      className={styles.star}
      aria-pressed={on}
      aria-label={on ? `Remove ${section.title} from saved` : `Save ${section.title}`}
      onClick={() => toggleSaved(section.id)}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

/* One dialog for every answer: the selected index is the only state, so
   stepping to the next question re-renders the body instead of mounting a
   second popup. Stars live in localStorage alongside concept progress — no
   account, and nothing to sync. */
export default function PrepBrowser({ sections }: { sections: PrepSection[] }) {
  const [onlySaved, setOnlySaved] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const saved = useSaved();
  const body = useRef<HTMLDivElement>(null);

  /* Which group is unfolded and which answer is open both live in the address
     bar, so ?q=s26 is a link straight to one question from anywhere on the site.
     `q` is the authored anchor, never the index: the index moves whenever a
     question is inserted and every link made to it would then point elsewhere. */
  const params = useUrlState();
  const asked = params.get("topic");
  const openTopic = TOPICS.find((topic) => topic === asked) ?? null;
  const at = sections.findIndex((section) => section.id === params.get("q"));
  const openAt = at === -1 ? null : at;

  const show = (q: string | null, topic: Topic | null = openTopic) =>
    setUrlState({ q, topic });

  const current = openAt === null ? null : sections[openAt];
  const savedCount = sections.filter((s) => saved.includes(s.id)).length;
  const shown = onlySaved ? sections.filter((s) => saved.includes(s.id)) : sections;
  /* A topic with nothing left in it after filtering is not rendered, so it cannot
     stay the open one — otherwise the layout sits in its opened state with no
     section to show. */
  const open = shown.some((section) => section.topic === openTopic) ? openTopic : null;

  function step(by: number) {
    if (openAt === null) return;
    const next = sections[(openAt + by + sections.length) % sections.length];
    setTip(null);
    show(next.id, next.topic);
    // the next answer starts at its own beginning, not where the last one was left
    body.current?.scrollTo({ top: 0 });
  }

  /* Opening a topic is a layout change, not a reveal: the tiles collapse into a
     row and the chosen one unfolds full width below them. startViewTransition
     animates the two layouts into each other — flushSync so React has finished
     the DOM by the time the browser takes its "after" snapshot. Without support,
     or when motion is unwelcome, the layout just switches. */
  function changeTopic(next: Topic | null) {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (calm || !document.startViewTransition) return show(null, next);
    document.startViewTransition(() => flushSync(() => show(null, next)));
  }

  const toggleTopic = (topic: Topic) => changeTopic(openTopic === topic ? null : topic);

  /* One tooltip for every cross-reference. Delegated listeners read the
     reference under the pointer (or the keyboard focus) and move a single bubble
     to it: the prose is injected HTML, so there is no per-reference component to
     hang a tooltip on. The bubble is fixed and lives outside the prose because
     the modal body scrolls — anything absolute inside it that is wide enough to
     hold a sentence pushes a horizontal scrollbar out of a reference mid-line.
     It stays mounted while empty so the aria-describedby on every reference
     always resolves to something. */
  function showTip(event: React.SyntheticEvent<HTMLDivElement>) {
    const ref = (event.target as HTMLElement).closest<HTMLElement>("[data-tip]");
    if (!ref) return;

    const box = ref.getBoundingClientRect();
    // Above, unless that would put it off the top of the window or over the title.
    const above = box.top > 170;
    setTip({
      text: ref.dataset.tip ?? "",
      x: box.left - 10,
      y: above ? box.top : box.bottom,
      above,
    });
  }

  return (
    <>
      <div className={styles.layout}>
        {/* Sticky to the viewport with its own scroll, and every topic closed by
            default: 57 titles at once is a wall, nine topic rows is an index.
            <details> owns its own open state — several can be expanded here at
            once, while the body shows one. */}
        <nav className={styles.toc} aria-label="All questions by topic">
          <p className={styles.tocHead}>
            Contents <span className={styles.count}>{sections.length}</span>
          </p>

          {TOPICS.map((topic) => {
            const items = sections.filter((section) => section.topic === topic);
            if (items.length === 0) return null;

            return (
              <details
                key={topic}
                className={styles.tocTopic}
                /* The rail is an index of the body, so using it moves the body.
                   Expanding only — collapsing here leaves the body alone, since
                   the body has its own control for that. */
                onToggle={(event) => {
                  if (event.currentTarget.open && topic !== openTopic) changeTopic(topic);
                }}
              >
                <summary className={styles.tocSummary}>
                  <span className={styles.tocCaret} aria-hidden="true">
                    ▸
                  </span>
                  {topic}
                  <span className={styles.count}>{items.length}</span>
                </summary>
                <ul className={styles.tocList}>
                  {items.map((section) => (
                    <li key={section.id}>
                      <button
                        type="button"
                        className={styles.tocItem}
                        /* No view transition: the dialog is about to cover the
                           body, and the point is where you land when you close it. */
                        onClick={() => show(section.id, section.topic)}
                      >
                        <span className={styles.tocNum}>{section.n}</span>
                        {section.title}
                        {saved.includes(section.id) && (
                          <span className={styles.tocStar} aria-hidden="true">
                            ★
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </nav>

        <div className={styles.main}>
          <div className={styles.filters} role="group" aria-label="Filter questions">
            <button
              type="button"
              className={styles.chip}
              aria-pressed={!onlySaved}
              onClick={() => setOnlySaved(false)}
            >
              All <span className={styles.count}>{sections.length}</span>
            </button>
            <button
              type="button"
              className={styles.chip}
              aria-pressed={onlySaved}
              onClick={() => setOnlySaved(true)}
            >
              ★ Saved <span className={styles.count}>{savedCount}</span>
            </button>
          </div>

          {onlySaved && savedCount === 0 && (
            <p className={styles.empty}>
              Nothing saved yet. Star a question and it stays here, in this browser.
            </p>
          )}

          {/* The same nine sections as the contents rail, in the same order. All
              closed, they are a grid of tiles; open one and the rest shrink into a
              row above it while it takes the full width. Every topic's cards stay
              mounted and hidden rather than unmounted, so the page's text is in the
              document whichever topic is open. */}
          <div className={`${styles.topics} ${open ? styles.browsing : ""}`}>
            {TOPICS.map((topic) => {
              const inTopic = shown.filter((section) => section.topic === topic);
              if (inTopic.length === 0) return null;

              const isOpen = topic === open;

              return (
                <section
                  key={topic}
                  className={`${styles.topic} ${isOpen ? styles.topicOpen : ""}`}
                  style={{ viewTransitionName: vt(topic) }}
                >
                  <button
                    type="button"
                    className={styles.topicHead}
                    aria-expanded={isOpen}
                    onClick={() => toggleTopic(topic)}
                  >
                    <span className={styles.groupCaret} aria-hidden="true">
                      ▸
                    </span>
                    <h2 className={styles.groupTitle}>{topic}</h2>
                    <span className={styles.count}>{inTopic.length}</span>
                  </button>

                  <div className={styles.grid} hidden={!isOpen}>
                    {inTopic.map((section) => (
                      <article key={section.id} className={styles.card}>
                        <div className={styles.cardTop}>
                          <span className={styles.cardNum}>
                            {String(section.n).padStart(2, "0")}
                          </span>
                          <span className={styles.cardTopic}>{section.topic}</span>
                          <Star section={section} on={saved.includes(section.id)} />
                        </div>

                        <h3 className={styles.cardTitle}>
                          {/* Stretched: the ::after covers the card, so the whole thing
                          opens the answer while staying one tab stop. */}
                          <button
                            type="button"
                            className={styles.open}
                            onClick={() => show(section.id)}
                          >
                            {section.title}
                          </button>
                        </h3>

                        <p className={styles.cardTeaser}>{section.teaser}</p>
                        <span className={styles.cardCta} aria-hidden="true">
                          Read the answer →
                        </span>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog.Root
        open={openAt !== null}
        onOpenChange={(open) => {
          // The bubble unmounts with the dialog, so a stale tip would reappear with it.
          if (!open) {
            setTip(null);
            show(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className={styles.backdrop} />
          <Dialog.Popup className={styles.popup}>
            {current && (
              <>
                <header className={styles.popupHead}>
                  <div>
                    <p className={styles.popupEyebrow}>
                      {current.topic} · {current.n} of {sections.length}
                    </p>
                    <Dialog.Title className={styles.popupTitle}>{current.title}</Dialog.Title>
                  </div>
                  <div className={styles.popupActions}>
                    <Star section={current} on={saved.includes(current.id)} />
                    <Dialog.Close className={styles.close} aria-label="Close">
                      ✕
                    </Dialog.Close>
                  </div>
                </header>

                <div className={styles.body} ref={body}>
                  {/* Authored HTML from src/content, not user input. */}
                  <div
                    className={styles.prose}
                    onMouseOver={showTip}
                    onMouseOut={() => setTip(null)}
                    onFocus={showTip}
                    onBlur={() => setTip(null)}
                    dangerouslySetInnerHTML={{ __html: current.html }}
                  />
                </div>

                <footer className={styles.popupFoot}>
                  <button type="button" className={styles.stepper} onClick={() => step(-1)}>
                    ← Previous
                  </button>
                  <button type="button" className={styles.stepper} onClick={() => step(1)}>
                    Next →
                  </button>
                </footer>
              </>
            )}
          </Dialog.Popup>

          {/* Outside the popup, which clips its own overflow, and keyed to nothing:
              one bubble, moved to whichever reference is hovered or focused. */}
          <div
            id="prep-xref-tip"
            role="tooltip"
            className={`${styles.tip} ${tip?.above ? styles.tipAbove : styles.tipBelow}`}
            hidden={!tip}
            style={
              {
                "--tip-x": `${tip?.x ?? 0}px`,
                "--tip-y": `${tip?.y ?? 0}px`,
              } as React.CSSProperties
            }
          >
            {tip?.text}
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
