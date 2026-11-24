import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { TOKENS } from "./tokens";

const tokensCss = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");
const [rootBlock, lightBlock] = tokensCss.split(':root[data-theme="light"]');

function declaredIn(block: string) {
  return [...block.matchAll(/(--sd-[\w-]+)\s*:/g)].map((match) => match[1]);
}

test("tokens.css parses into both theme blocks", () => {
  expect(declaredIn(rootBlock).length).toBeGreaterThan(20);
  expect(declaredIn(lightBlock).length).toBeGreaterThan(10);
});

test("every token in tokens.css is documented in the Storybook catalog", () => {
  const documented = new Set<string>(TOKENS.map((token) => token.name));
  expect(declaredIn(rootBlock).filter((name) => !documented.has(name))).toEqual([]);
});

test("the catalog documents no token that tokens.css does not declare", () => {
  const declared = new Set(declaredIn(rootBlock));
  expect(TOKENS.map((token) => token.name).filter((name) => !declared.has(name))).toEqual([]);
});

test("light mode only overrides tokens that dark mode declares", () => {
  const declared = new Set(declaredIn(rootBlock));
  expect(declaredIn(lightBlock).filter((name) => !declared.has(name))).toEqual([]);
});
