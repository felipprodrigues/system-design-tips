import { useEffect } from "react";
import type { Decorator } from "@storybook/react-vite";
import type { ColorScheme } from "../src/components/ThemeToggle/ThemeToggle";
import { setMockNavigation } from "./mocks/next-navigation";

export const withTheme: Decorator = (Story, context) => {
  const theme: ColorScheme = context.globals.theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  return <Story />;
};

export const withNextNavigation: Decorator = (Story, context) => {
  setMockNavigation(context.parameters.nextjs?.navigation ?? {});
  return <Story />;
};

/* src/lib/progress.ts caches each list at module level and only drops the cache on a
   `storage` event, so seeding alone would leave the previous story's progress on
   screen. The event is dispatched after mount, once the stores have subscribed.
   Story parameters deep-merge with the meta's, so a story unsets a key with null. */
function seedStorage(seed: Record<string, unknown>) {
  localStorage.clear();
  for (const [key, value] of Object.entries(seed)) {
    if (value === null) continue;
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  }
}

function StorageSync({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
  }, []);
  return children;
}

export const withLocalStorage: Decorator = (Story, context) => {
  seedStorage(context.parameters.localStorage ?? {});
  return (
    <StorageSync>
      <Story />
    </StorageSync>
  );
};
