"use client";

import { type KeyboardEvent, useId, useRef, useState } from "react";
import styles from "../event-loop/eventLoop.module.css";
import ClosurePractice from "./ClosurePractice";
import type { Exercise } from "./exercise";

export default function PracticeTabs({ exercises }: { exercises: Exercise[] }) {
  const [at, setAt] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  function onKeyDown(event: KeyboardEvent, i: number) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (i + step + exercises.length) % exercises.length;
    setAt(next);
    tabs.current[next]?.focus();
  }

  return (
    <>
      <div role="tablist" aria-label="Puzzles" className={styles.picker}>
        {exercises.map((_, i) => (
          <button
            key={i}
            ref={(node) => {
              tabs.current[i] = node;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === at}
            aria-controls={`${id}-panel`}
            tabIndex={i === at ? 0 : -1}
            className={styles.chipBtn}
            onClick={() => setAt(i)}
            onKeyDown={(event) => onKeyDown(event, i)}
          >
            Puzzle {i + 1}
          </button>
        ))}
      </div>

      {/* Only the open puzzle is mounted: the walkthrough measures its boxes to draw arrows, and a hidden panel measures as zero. */}
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${at}`}>
        <ClosurePractice key={at} exercise={exercises[at]} />
      </div>
    </>
  );
}
