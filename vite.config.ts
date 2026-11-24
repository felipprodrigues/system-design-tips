import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

/* Read by Storybook and Vitest only, never by Next, so these Next stand-ins cannot
   reach the app. */
export default defineConfig({
  resolve: {
    alias: [
      { find: /^next\/link$/, replacement: path("./.storybook/mocks/next-link.tsx") },
      { find: /^next\/image$/, replacement: path("./.storybook/mocks/next-image.tsx") },
      { find: /^next\/navigation$/, replacement: path("./.storybook/mocks/next-navigation.ts") },
      { find: "@", replacement: path("./src") },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.tsx"],
    setupFiles: ["./.storybook/vitest.setup.ts"],
  },
});
