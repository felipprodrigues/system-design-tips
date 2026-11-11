"use client";

import { useSyncExternalStore } from "react";

/* The query string as a store, so a page can keep "where you were" in the address
   bar and a refresh or a pasted link lands in the same place.

   Read through useSyncExternalStore rather than an effect: hydration takes the
   server's empty snapshot and the real query string arrives on the next render,
   so there is no setState in an effect and no mismatch to paper over. It is also
   why a deep link opens on the render after the first paint, not during it. */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

const EMPTY = new URLSearchParams();

export function useUrlState(): URLSearchParams {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  return search ? new URLSearchParams(search) : EMPTY;
}

/* replace rather than push: the back button should leave the page, not walk back
   through every card that was opened on it. A null value drops the key. */
export function setUrlState(changes: Record<string, string | null>) {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }

  const query = params.toString();
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  for (const listener of listeners) listener();
}
