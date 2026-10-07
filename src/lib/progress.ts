"use client";

import { useSyncExternalStore } from "react";

/* Which lessons someone has marked learned, kept only in their browser — no account,
   no server, nothing to sign into.

   localStorage rather than a cookie, deliberately: a cookie written from JS is capped
   at 7 days by Safari's ITP, so progress would quietly vanish after a week, and every
   lesson route here is statically prerendered — reading a cookie server-side would opt
   all of them out of static rendering. Swapping the two lines in read/write below for
   document.cookie is all it takes if that trade ever looks worth it. */

const KEY = "sd-completed";

const listeners = new Set<() => void>();

/** useSyncExternalStore needs a stable reference, so the parsed list is cached. */
let cached: readonly string[] | undefined;

function read(): readonly string[] {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(KEY);
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

/** Another tab changed the list — drop the cache so the next read reparses. */
function invalidate() {
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

/** Nothing is learned as far as the server knows; the real list arrives after hydration. */
const EMPTY: readonly string[] = [];

export function useLearned(): readonly string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function toggleLearned(slug: string) {
  const current = read();
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable or full: the toggle still flips for this page view.
  }

  cached = next;
  notify();
}
