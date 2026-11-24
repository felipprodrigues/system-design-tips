import { globSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { composeStories } from "@storybook/react-vite";
import type { Meta } from "@storybook/react-vite";

type StoryModule = Parameters<typeof composeStories>[0] & { default: Meta };

const files = globSync("src/**/*.stories.tsx").sort();
const modules = await Promise.all(
  files.map(async (file) => [file, (await import(/* @vite-ignore */ `/${file}`)) as StoryModule] as const),
);

/* React reports a render that threw, a missing key and an invalid DOM prop through
   console.error rather than by throwing, so a story that "renders" while broken
   would otherwise pass. */
let errors: unknown[][] = [];
beforeEach(() => {
  errors = [];
  vi.spyOn(console, "error").mockImplementation((...args) => {
    errors.push(args);
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

test("stories are discovered", () => {
  expect(files.length).toBeGreaterThan(10);
});

for (const [file, module] of modules) {
  describe(module.default.title ?? file, () => {
    const stories: Record<string, { run: () => Promise<void> }> = composeStories(module);
    for (const [name, Story] of Object.entries(stories)) {
      test(name, async () => {
        await Story.run();
        expect(errors.map((args) => args.map(String).join(" "))).toEqual([]);
      });
    }
  });
}
