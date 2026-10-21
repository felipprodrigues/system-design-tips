"use client";

import { useSyncExternalStore } from "react";

/* What someone has read and what they've marked learned, kept only in their browser
   — no account, no server, nothing to sign into.

   localStorage rather than a cookie, deliberately: a cookie written from JS is capped
   at 7 days by Safari's ITP, so progress would quietly vanish after a week, and every
   concept route here is statically prerendered — reading a cookie server-side would opt
   all of them out of static rendering.

   Two lists, because the dashboard needs three states and a boolean only gives two:
   opening a concept records it as visited, and the Complete button records it as done.
   Visited-but-not-done is what "In Progress" means. */

const COMPLETED_KEY = "sd-completed";
const VISITED_KEY = "sd-visited";

/** Nothing is known as far as the server knows; the real list arrives after hydration. */
const EMPTY: readonly string[] = [];

/* One store per key. A factory rather than two copies of the same forty lines —
   the caching and cross-tab wiring is identical, only the key differs. */
function createSlugStore(key: string) {
  const listeners = new Set<() => void>();
  /** useSyncExternalStore needs a stable reference, so the parsed list is cached. */
  let cached: readonly string[] | undefined;

  function read(): readonly string[] {
    if (cached) return cached;
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      cached = Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
    } catch {
      // Private mode, disabled storage, or hand-edited junk: start from empty.
      cached = [];
    }
    return cached;
  }

  function notify() {
    for (const listener of listeners) listener();
  }

  /** Another tab changed this list — drop the cache so the next read reparses. */
  function invalidate(event: StorageEvent) {
    if (event.key !== null && event.key !== key) return;
    cached = undefined;
    notify();
  }

  function subscribe(onChange: () => void) {
    if (listeners.size === 0) window.addEventListener("storage", invalidate);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
      if (listeners.size === 0) window.removeEventListener("storage", invalidate);
    };
  }

  function write(next: readonly string[]) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage unavailable or full: the change still holds for this page view.
    }
    cached = next;
    notify();
  }

  return {
    use: () => useSyncExternalStore(subscribe, read, () => EMPTY),
    peek: read,
    toggle(slug: string) {
      const current = read();
      write(current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]);
    },
    /* Move-to-end rather than append-if-missing, so the tail of the list is the
       most recently touched slug. That ordering is the only record of "last
       visited" there is — nothing stores timestamps. */
    touch(slug: string) {
      const current = read();
      const next = current.filter((s) => s !== slug);
      next.push(slug);
      write(next);
    },
  };
}

const completed = createSlugStore(COMPLETED_KEY);
const visited = createSlugStore(VISITED_KEY);

export function useLearned(): readonly string[] {
  return completed.use();
}

export function toggleLearned(slug: string) {
  completed.toggle(slug);
  /* Marking something done without having opened it — possible from the concepts
     list — still counts as visited, so the two lists never disagree. */
  visited.touch(slug);
}

export function useVisited(): readonly string[] {
  return visited.use();
}

export function markVisited(slug: string) {
  visited.touch(slug);
}

export type Status = "done" | "doing" | "todo";

/** Done beats in-progress: a concept you finished and reopened still reads as done. */
export function statusOf(slug: string, learned: readonly string[], seen: readonly string[]): Status {
  if (learned.includes(slug)) return "done";
  return seen.includes(slug) ? "doing" : "todo";
}

export const STATUS_LABEL: Record<Status, string> = {
  done: "Completed",
  doing: "In progress",
  todo: "Not started",
};
