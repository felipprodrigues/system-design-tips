import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { LEGACY_CLASSES } from "./legacyClasses";

const declared = [
  ...new Set(
    ["src/styles/concept.css", "src/styles/base.css"].flatMap((file) =>
      [...readFileSync(join(process.cwd(), file), "utf8").matchAll(/\.(sd-[a-z0-9-]+)/g)].map((match) => match[1]),
    ),
  ),
];

test("the shared stylesheets declare sd- classes", () => {
  expect(declared.length).toBeGreaterThan(30);
});

test("every shared sd- class has an entry in the Storybook catalog", () => {
  const catalogued = new Set(LEGACY_CLASSES.map((entry) => entry.className));
  expect(declared.filter((name) => !catalogued.has(name))).toEqual([]);
});

test("the catalog lists no class the stylesheets no longer declare", () => {
  expect(LEGACY_CLASSES.map((entry) => entry.className).filter((name) => !declared.includes(name))).toEqual([]);
});
