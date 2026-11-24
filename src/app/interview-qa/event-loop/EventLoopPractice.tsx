"use client";

import { useEffect, useState } from "react";
import type { Exercise, Phase, Step } from "./exercises";
import styles from "./eventLoop.module.css";

const PHASE: Record<Phase, string> = {
  Start: "",
  Sync: "",
  "Event loop": "",
  Microtask: styles.phaseMicro,
  Macrotask: styles.phaseMacro,
  Done: styles.phaseDone,
};

function Code({ code, active = [] }: { code: string[]; active?: number[] }) {
  return (
    <div className={styles.code}>
      {code.map((line, i) => (
        <div
          key={i}
          className={`${styles.line} ${active.includes(i) ? styles.lineOn : ""}`}
        >
          {line || " "}
        </div>
      ))}
    </div>
  );
}

function Chips({ items, kind }: { items: string[]; kind: string }) {
  if (items.length === 0) return <span className={styles.empty}>empty</span>;

  return (
    <>
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className={`${styles.chip} ${kind}`}>
          {item}
        </span>
      ))}
    </>
  );
}

/* The board: tap an output to drop it in the next free slot, tap a placed one to
   take it back. Tapping rather than dragging so the same control works with a
   mouse, a thumb and a keyboard, with no pointer handling of our own. */
function Board({ ex }: { ex: Exercise }) {
  const [slots, setSlots] = useState<(string | null)[]>(() =>
    Array(ex.answer.length).fill(null),
  );
  const [checked, setChecked] = useState(false);

  // Sorted, not shuffled: it reads the same on the server and it is never the answer.
  const pool = [...ex.answer].sort();
  const placed = new Set(slots.filter((slot): slot is string => slot !== null));

  function place(token: string) {
    const free = slots.indexOf(null);
    if (free === -1) return;
    setSlots(slots.map((slot, i) => (i === free ? token : slot)));
    setChecked(false);
  }

  function clear(at: number) {
    setSlots(slots.map((slot, i) => (i === at ? null : slot)));
    setChecked(false);
  }

  const right = slots.filter((slot, i) => slot === ex.answer[i]).length;
  const empty = slots.filter((slot) => slot === null).length;

  return (
    <section aria-label="Answer board">
      <p className={styles.boardHead}>Print order</p>

      <ol className={styles.slots}>
        {slots.map((slot, i) => {
          const mark = checked && slot !== null ? (slot === ex.answer[i] ? styles.slotOk : styles.slotBad) : "";

          return (
            <li key={i} className={`${styles.slot} ${mark}`}>
              <span className={styles.slotN}>{i + 1}</span>
              {slot !== null && (
                <button
                  type="button"
                  className={styles.tile}
                  onClick={() => clear(i)}
                  aria-label={`Remove ${slot} from position ${i + 1}`}
                >
                  {slot}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <div className={styles.pool} aria-label="Unplaced outputs">
        {pool.map((token) => (
          <button
            key={token}
            type="button"
            className={styles.tile}
            disabled={placed.has(token)}
            onClick={() => place(token)}
            aria-label={`Place ${token} next`}
          >
            {token}
          </button>
        ))}
        {empty === 0 && <span className={styles.poolDone}>All placed.</span>}
      </div>

      <div className={styles.bar}>
        <button type="button" className={styles.btnPri} onClick={() => setChecked(true)}>
          Check answer
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => {
            setSlots(Array(ex.answer.length).fill(null));
            setChecked(false);
          }}
        >
          Clear board
        </button>
      </div>

      <p className={styles.result} aria-live="polite">
        {checked &&
          (right === ex.answer.length ? (
            <strong className={styles.allRight}>
              All {right} right. {ex.answer.join(" ")}
            </strong>
          ) : (
            <>
              <strong>
                {right} of {ex.answer.length}
              </strong>{" "}
              in the right place
              {empty > 0 && `, ${empty} still empty`}.
            </>
          ))}
      </p>
    </section>
  );
}

function Walkthrough({ ex }: { ex: Exercise }) {
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step: Step = ex.steps[at];
  const last = ex.steps.length - 1;

  useEffect(() => {
    if (!playing || at === last) return;

    const timer = setTimeout(() => {
      setAt(at + 1);
      if (at + 1 === last) setPlaying(false);
    }, 1700);
    return () => clearTimeout(timer);
  }, [playing, at, last]);

  const go = (by: number) => {
    setPlaying(false);
    setAt((n) => Math.min(last, Math.max(0, n + by)));
  };

  return (
    <div className={styles.walk}>
      <div
        className={styles.bar}
        role="toolbar"
        aria-label="Walkthrough controls"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(1);
          if (event.key === "ArrowLeft") go(-1);
        }}
      >
        <button type="button" className={styles.btn} onClick={() => go(-1)} disabled={at === 0}>
          ← Back
        </button>
        <button type="button" className={styles.btnPri} onClick={() => go(1)} disabled={at === last}>
          Next →
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => {
            if (at === last) setAt(0);
            setPlaying(!playing);
          }}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => {
            setPlaying(false);
            setAt(0);
          }}
        >
          Restart
        </button>
        <span className={styles.count}>
          Step {at} of {last}
        </span>
      </div>

      <p className={styles.msg}>
        <span className={`${styles.phase} ${PHASE[step.phase]}`}>{step.phase}</span>
        <span>{step.note}</span>
      </p>

      <div className={styles.walkGrid}>
        <Code code={ex.code} active={step.lines} />

        <div>
          <div className={styles.box}>
            <p className={styles.boxLabel}>Call stack</p>
            <div className={styles.chips}>
              <Chips items={step.stack} kind={styles.chipStack} />
            </div>
          </div>
          <div className={`${styles.box} ${styles.boxWait}`}>
            <p className={styles.boxLabel}>Waiting on a promise (not queued yet)</p>
            <div className={styles.chips}>
              <Chips items={step.waiting} kind={styles.chipWait} />
            </div>
          </div>
          <div className={styles.box}>
            <p className={styles.boxLabel}>Microtask queue</p>
            <div className={styles.chips}>
              <Chips items={step.micro} kind={styles.chipMicro} />
            </div>
          </div>
          <div className={styles.box}>
            <p className={styles.boxLabel}>Macrotask queue (setTimeout)</p>
            <div className={styles.chips}>
              <Chips items={step.macro} kind={styles.chipMacro} />
            </div>
          </div>
          <div className={styles.box}>
            <p className={styles.boxLabel}>Console</p>
            <div className={styles.chips}>
              <Chips items={step.out} kind={styles.chipOut} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventLoopPractice({ exercises }: { exercises: Exercise[] }) {
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);
  const ex = exercises[at];

  /* Re-roll, not next: picking at random is what makes it practice rather than a
     list read in order. Never the one already on screen. */
  function roll() {
    const others = exercises.map((_, i) => i).filter((i) => i !== at);
    setAt(others[Math.floor(Math.random() * others.length)]);
    setOpen(false);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.picker}>
        {exercises.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={styles.chipBtn}
            aria-pressed={i === at}
            onClick={() => {
              setAt(i);
              setOpen(false);
            }}
          >
            {item.title}
          </button>
        ))}
        <button type="button" className={styles.roll} onClick={roll}>
          ⟳ Roll another
        </button>
      </div>

      <div className={styles.grid} key={ex.id}>
        <section aria-label="Exercise code">
          <p className={styles.point}>{ex.point}</p>
          <p className={styles.hint}>{ex.hint}</p>
          <Code code={ex.code} />
        </section>

        <Board ex={ex} />
      </div>

      <details
        className={styles.spoiler}
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary className={styles.summary}>Show the walkthrough (spoilers)</summary>
        {/* Mounted only while open, so Play stops itself when the answer is folded away. */}
        {open && <Walkthrough key={ex.id} ex={ex} />}
      </details>
    </div>
  );
}
