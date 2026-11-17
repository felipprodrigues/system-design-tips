"use client";

import { useEffect, useState } from "react";
import styles from "../event-loop/eventLoop.module.css";
import own from "./closures.module.css";
import type { Exercise, Phase, Scope } from "./exercise";

const PHASE: Partial<Record<Phase, string>> = {
  Closure: styles.phaseMicro,
  Update: styles.phaseMacro,
  Done: styles.phaseDone,
};

function Code({ code, active = [] }: { code: string[]; active?: number[] }) {
  return (
    <div className={styles.code}>
      {code.map((line, i) => (
        <div key={i} className={`${styles.line} ${active.includes(i) ? styles.lineOn : ""}`}>
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

function Scopes({ scopes }: { scopes: Scope[] }) {
  if (scopes.length === 0) return <span className={styles.empty}>empty</span>;

  return (
    <div className={own.scopes}>
      {scopes.map((scope) => (
        <div
          key={scope.name}
          className={`${own.scope} ${scope.kept ? own.kept : ""} ${scope.fresh ? own.fresh : ""}`}
        >
          <p className={own.scopeHead}>
            {scope.name}
            {scope.kept && <span className={own.tag}>{scope.kept}</span>}
          </p>
          <div className={own.vars}>
            {scope.vars.map(([name, value]) => (
              <span
                key={name}
                className={`${own.var} ${scope.changed?.includes(name) ? own.changed : ""}`}
              >
                {name} = <b>{value}</b>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Same tap-to-place board as the event loop one, but the slots are lettered
   console.logs rather than print positions, and the pool has repeats and decoys,
   so tiles are tracked by index, not by value. */
function Board({ ex }: { ex: Exercise }) {
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(ex.labels.length).fill(null));
  const [checked, setChecked] = useState(false);

  function place(tile: number) {
    const free = slots.indexOf(null);
    if (free === -1) return;
    setSlots(slots.map((slot, i) => (i === free ? tile : slot)));
    setChecked(false);
  }

  function clear(at: number) {
    setSlots(slots.map((slot, i) => (i === at ? null : slot)));
    setChecked(false);
  }

  const value = (slot: number | null) => (slot === null ? null : ex.tiles[slot]);
  const right = slots.filter((slot, i) => value(slot) === ex.answer[i]).length;
  const empty = slots.filter((slot) => slot === null).length;

  return (
    <section className={styles.board} aria-label="Answer board">
      <p className={styles.boardHead}>Printed values</p>

      <ol className={styles.slots}>
        {slots.map((slot, i) => {
          const mark =
            checked && slot !== null ? (value(slot) === ex.answer[i] ? styles.slotOk : styles.slotBad) : "";

          return (
            <li key={i} className={`${styles.slot} ${mark}`}>
              <span className={styles.slotN}>{ex.labels[i]}</span>
              {slot !== null && (
                <button
                  type="button"
                  className={styles.tile}
                  onClick={() => clear(i)}
                  aria-label={`Remove ${ex.tiles[slot]} from ${ex.labels[i]}`}
                >
                  {ex.tiles[slot]}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <div className={styles.pool} aria-label="Unplaced values">
        {ex.tiles.map((tile, i) => (
          <button
            key={i}
            type="button"
            className={styles.tile}
            disabled={slots.includes(i)}
            onClick={() => place(i)}
            aria-label={`Place ${tile} in the next slot`}
          >
            {tile}
          </button>
        ))}
        {empty === 0 && <span className={styles.poolDone}>All slots filled.</span>}
      </div>

      <div className={styles.bar}>
        <button type="button" className={styles.btnPri} onClick={() => setChecked(true)}>
          Check answer
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => {
            setSlots(Array(ex.labels.length).fill(null));
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
              All {right} right. {ex.answer.join(", ")}
            </strong>
          ) : (
            <>
              <strong>
                {right} of {ex.answer.length}
              </strong>{" "}
              right
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
  const step = ex.steps[at];
  const last = ex.steps.length - 1;

  useEffect(() => {
    if (!playing || at === last) return;

    const timer = setTimeout(() => {
      setAt(at + 1);
      if (at + 1 === last) setPlaying(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [playing, at, last]);

  const go = (by: number) => {
    setPlaying(false);
    setAt((n) => Math.min(last, Math.max(0, n + by)));
  };

  return (
    <div
      className={styles.walk}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
    >
      <div className={styles.bar}>
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
        <span className={`${styles.phase} ${PHASE[step.phase] ?? ""}`}>{step.phase}</span>
        <span>{step.note}</span>
      </p>

      <div className={styles.walkGrid}>
        <Code code={ex.code} active={step.lines} />

        <div>
          <div className={styles.box}>
            <p className={styles.boxLabel}>
              Scopes in memory (a highlighted border means a function is still holding on to it)
            </p>
            <Scopes scopes={step.scopes} />
          </div>
          <div className={styles.box}>
            <p className={styles.boxLabel}>Call stack</p>
            <div className={styles.chips}>
              <Chips items={step.stack} kind={styles.chipStack} />
            </div>
          </div>
          <div className={styles.box}>
            <p className={styles.boxLabel}>Console</p>
            <div className={styles.chips}>
              <Chips
                items={step.out.map((value, i) => `${ex.labels[i]}: ${value}`)}
                kind={styles.chipOut}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClosurePractice({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <section aria-label="Exercise code">
          <p className={styles.point}>
            Drop a value into each lettered slot to say what that console.log prints. There are
            more tiles than slots, so some won&apos;t be used.
          </p>
          <p className={styles.hint}>
            Each call to a function creates a new set of its variables. A closure keeps the variable
            itself, not a copy of its value. var makes one variable for the whole loop, while let
            makes a new one each time round.
          </p>
          <Code code={exercise.code} />
        </section>

        <Board ex={exercise} />
      </div>

      <details
        className={styles.spoiler}
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary className={styles.summary}>Show the walkthrough (spoilers)</summary>
        {open && <Walkthrough ex={exercise} />}
      </details>
    </div>
  );
}
