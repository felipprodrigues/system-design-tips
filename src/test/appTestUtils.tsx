import { act, render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { setMockNavigation } from "../../.storybook/mocks/next-navigation";

export function atRoute(pathname: string, search = "") {
  setMockNavigation({ pathname });
  window.history.replaceState(null, "", `${pathname}${search}`);
}

/* src/lib/progress.ts caches every list at module level and drops the cache only
   on a `storage` event, which it listens for while something is subscribed. So
   storage is seeded, the tree mounted, and then the event fired. */
export function renderWithStorage(ui: ReactElement, seed: Record<string, unknown> = {}): RenderResult {
  localStorage.clear();
  for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, JSON.stringify(value));
  const result = render(ui);
  act(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
  });
  return result;
}

export function storedList(key: string): unknown[] {
  return JSON.parse(localStorage.getItem(key) ?? "[]");
}
