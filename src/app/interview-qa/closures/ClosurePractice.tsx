"use client";

import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "../event-loop/eventLoop.module.css";
import { ArrowMarker } from "@/design-system";
import own from "./closures.module.css";
import type { Exercise, Phase, Scope } from "./exercise";

const PHASE: Partial<Record<Phase, string>> = {
  Closure: styles.phaseMicro,
  Update: styles.phaseMacro,
  Read: styles.phaseMicro,
  Mutate: styles.phaseMacro,
  Collect: styles.phaseMacro,
  Done: styles.phaseDone,
};

const SLOT = /\/\/ ([A-Z])\s*$/;
const TOKEN = /(`[^`]+`|#\d+)/;

const boxId = (scope: Scope) => scope.name.split(" ")[0];

function Note({
  text,
  scopes,
  onRef,
}: {
  text: string;
  scopes: Scope[];
  onRef: (ref: string | null) => void;
}) {
  const ids = new Set(scopes.map(boxId));

  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith("`")) {
      return (
        <code key={i} className={own.noteCode}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (ids.has(part)) {
      return (
        <button
          key={i}
          type="button"
          className={own.ref}
          onMouseEnter={() => onRef(part)}
          onMouseLeave={() => onRef(null)}
          onFocus={() => onRef(part)}
          onBlur={() => onRef(null)}
        >
          {part}
        </button>
      );
    }
    return part;
  });
}

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

function target(scopes: Scope[], to: string) {
  const name = to.replace(/^~/, "");
  return scopes.find(
    (scope) =>
      scope.name === name || scope.name.startsWith(`${name} `) || scope.name.startsWith(`${name},`),
  );
}

/* A box sits one column right of the furthest box pointing at it, so arrows
   mostly run left to right: names, then what they hold, then what that holds. */
function columns(scopes: Scope[]) {
  const col = new Map(scopes.map((scope) => [scope, 0]));
  for (let pass = 0; pass < scopes.length; pass++) {
    for (const scope of scopes) {
      for (const [, , to] of scope.vars) {
        const hit = to && target(scopes, to);
        if (hit && hit !== scope)
          col.set(hit, Math.max(col.get(hit)!, Math.min(col.get(scope)! + 1, 2)));
      }
    }
  }
  return col;
}

interface Arrow {
  d: string;
  weak: boolean;
}

/* The boxes are laid out by CSS, so the arrows can only be drawn once the
   browser has placed them: measured on mount, and again on every resize. The
   Stage is keyed by step, so a new step is a fresh mount. */
function Stage({ scopes, hot }: { scopes: Scope[]; hot?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const col = columns(scopes);
  const count = Math.max(0, ...col.values()) + 1;

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const base = el.getBoundingClientRect();
      const boxes = new Map(
        [...el.querySelectorAll<HTMLElement>("[data-box]")].map((box) => [box.dataset.box, box]),
      );

      setArrows(
        [...el.querySelectorAll<HTMLElement>("[data-to]")].flatMap((port) => {
          const to = port.dataset.to!;
          const box = boxes.get(target(scopes, to)?.name);
          if (!box) return [];

          const p = port.getBoundingClientRect();
          const t = box.getBoundingClientRect();
          const sx = p.left + p.width / 2 - base.left;
          const sy = p.top + p.height / 2 - base.top;
          const ey = t.top + 15 - base.top;

          if (t.left - base.left > sx + 16) {
            const ex = t.left - base.left - 2;
            const dx = Math.max(24, (ex - sx) / 2);
            return [
              {
                d: `M${sx},${sy} C${sx + dx},${sy} ${ex - dx},${ey} ${ex},${ey}`,
                weak: to.startsWith("~"),
              },
            ];
          }

          const ex = t.right - base.left + 2;
          const cx = Math.max(sx, ex) + 34;
          return [
            { d: `M${sx},${sy} C${cx},${sy} ${cx},${ey} ${ex},${ey}`, weak: to.startsWith("~") },
          ];
        }),
      );
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [scopes]);

  if (scopes.length === 0) return <p className={styles.empty}>Nothing in memory yet.</p>;

  return (
    <div ref={root} className={own.stage}>
      <div className={own.cols} style={{ "--cols": count } as CSSProperties}>
        {Array.from({ length: count }, (_, c) => (
          <div key={c} className={own.col}>
            {scopes
              .filter((scope) => col.get(scope) === c)
              .map((scope) => (
                <div
                  key={scope.name}
                  data-box={scope.name}
                  className={`${own.scope} ${scope.kept ? own.kept : ""} ${scope.fresh ? own.fresh : ""} ${boxId(scope) === hot ? own.hot : ""}`}
                >
                  <p className={own.scopeHead}>{scope.name}</p>
                  {scope.kept && <span className={own.tag}>{scope.kept}</span>}
                  <div className={own.vars}>
                    {scope.vars.map(([name, value, to]) => (
                      <span
                        key={name}
                        className={`${own.var} ${scope.changed?.includes(name) ? own.changed : ""}`}
                      >
                        <span>
                          {name}
                          {value && (
                            <>
                              {" "}
                              = <b>{value}</b>
                            </>
                          )}
                        </span>
                        {to && target(scopes, to) && (
                          <span
                            data-to={to}
                            className={`${own.port} ${to.startsWith("~") ? own.portWeak : ""}`}
                          />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      <svg className={own.arrows} aria-hidden="true">
        <defs>
          <ArrowMarker id="ref-head" color="text" />
        </defs>
        {arrows.map((arrow, i) => (
          <path
            key={i}
            d={arrow.d}
            className={`${own.arrow} ${arrow.weak ? own.arrowWeak : ""}`}
            markerEnd="url(#ref-head)"
          />
        ))}
      </svg>
    </div>
  );
}

/* Tap-to-place, with each slot sitting where its console.log is. The pool has
   repeats and decoys, so tiles are tracked by index, not by value. */
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
  const next = slots.indexOf(null);

  function slot(i: number) {
    const placed = slots[i];
    const mark =
      checked && placed !== null ? (value(placed) === ex.answer[i] ? own.ok : own.bad) : "";

    return (
      <span className={`${own.slot} ${i === next ? own.slotNext : ""} ${mark}`}>
        <span className={own.slotN}>{ex.labels[i]}</span>
        {placed !== null ? (
          <button
            type="button"
            className={own.tile}
            onClick={() => clear(i)}
            aria-label={`Remove ${ex.tiles[placed]} from ${ex.labels[i]}`}
          >
            {ex.tiles[placed]}
          </button>
        ) : (
          <span className={own.slotQ}>?</span>
        )}
      </span>
    );
  }

  return (
    <section aria-label="Answer board" className={own.board}>
      <div className={styles.code}>
        {ex.code.map((line, i) => {
          const hit = SLOT.exec(line);
          const at = hit ? ex.labels.indexOf(hit[1]) : -1;

          return (
            <div key={i} className={`${styles.line} ${own.codeLine}`}>
              {at === -1 ? (
                line || " "
              ) : (
                <>
                  {line.slice(0, hit!.index).trimEnd()}
                  {"  "}
                  {slot(at)}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className={own.side}>
        <p className={styles.boardHead}>Values to place</p>
        <div className={own.pool} aria-label="Unplaced values">
          {ex.tiles.map((tile, i) => (
            <button
              key={i}
              type="button"
              className={own.tile}
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
          <button
            type="button"
            className={`${styles.btnPri} ${own.pop}`}
            onClick={() => setChecked(true)}
          >
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
      </div>
    </section>
  );
}

export function Timeline({
  steps,
  at,
  go,
}: {
  steps: { phase: string }[];
  at: number;
  go: (to: number) => void;
}) {
  const last = steps.length - 1;

  return (
    <div className={own.timeline}>
      <div className={own.track}>
        <div className={own.fill} style={{ width: `${(at / last) * 100}%` }} />
        {steps.map((step, i) => (
          <button
            key={i}
            type="button"
            className={`${own.dot} ${i <= at ? own.dotDone : ""}`}
            style={{ left: `${(i / last) * 100}%` }}
            aria-label={`Step ${i}: ${step.phase}`}
            aria-current={i === at ? "step" : undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}

function Walkthrough({ ex }: { ex: Exercise }) {
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [focus, setFocus] = useState<[number, string]>();
  const step = ex.steps[at];
  const hot = focus?.[0] === at ? focus[1] : undefined;
  const last = ex.steps.length - 1;

  useEffect(() => {
    if (!playing || at === last) return;

    const timer = setTimeout(() => {
      setAt(at + 1);
      if (at + 1 === last) setPlaying(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, [playing, at, last]);

  const jump = (to: number) => {
    setPlaying(false);
    setAt(Math.min(last, Math.max(0, to)));
  };

  return (
    <div className={styles.walk}>
      <div className={own.hud}>
        <div className={own.hudChip}>
          <span className={own.hudLabel}>Console</span>
          <div className={styles.chips}>
            <Chips
              items={step.out.map((value, i) => `${ex.labels[i]}  ${value}`)}
              kind={styles.chipOut}
            />
          </div>
        </div>
        <div className={own.hudChip}>
          <span className={own.hudLabel}>Call stack</span>
          <div className={styles.chips}>
            <Chips items={step.stack} kind={styles.chipStack} />
          </div>
        </div>
      </div>

      <p className={styles.msg}>
        <span className={`${styles.phase} ${PHASE[step.phase] ?? ""}`}>{step.phase}</span>
        <span key={at} className={own.note}>
          <Note
            text={step.note}
            scopes={step.scopes}
            onRef={(ref) => setFocus(ref ? [at, ref] : undefined)}
          />
        </span>
      </p>

      <div className={own.walkGrid}>
        <Code code={ex.code} active={step.lines} />
        <div className={own.memory}>
          <p className={styles.boxLabel}>{ex.memory}</p>
          <Stage key={at} scopes={step.scopes} hot={hot} />
        </div>
      </div>

      <div
        className={own.controls}
        role="toolbar"
        aria-label="Walkthrough controls"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") jump(at + 1);
          if (event.key === "ArrowLeft") jump(at - 1);
        }}
      >
        <button
          type="button"
          className={styles.btn}
          onClick={() => jump(at - 1)}
          disabled={at === 0}
        >
          ← Back
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
        <Timeline steps={ex.steps} at={at} go={jump} />
        <button
          type="button"
          className={`${styles.btnPri} ${own.pop}`}
          onClick={() => jump(at + 1)}
          disabled={at === last}
        >
          Next →
        </button>
        <span className={styles.count}>
          {at} / {last}
        </span>
      </div>
    </div>
  );
}

export default function ClosurePractice({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <p className={styles.point}>
        Tap a tile to drop it into the next empty slot, right where that console.log sits. There are
        more tiles than slots, so some won&apos;t be used. Tap a placed tile to take it back.
      </p>
      <p className={styles.hint}>{exercise.hint}</p>

      <Board ex={exercise} />

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
