import { expect, test } from "vitest";
import { TONES, toneColor, toneVars, toneWash } from "./tone";

test("every tone resolves to its own token", () => {
  for (const tone of TONES) expect(toneColor(tone)).toBe(`var(--sd-${tone})`);
});

test("a tone with a wash token uses it, so light mode gets the hand-tuned wash", () => {
  expect(toneWash("accent")).toBe("var(--sd-accent-wash)");
  expect(toneWash("danger")).toBe("var(--sd-danger-wash)");
});

test("a tone without a wash token mixes one from its colour at 12%", () => {
  expect(toneWash("teal")).toBe("color-mix(in srgb, var(--sd-teal) 12%, transparent)");
});

test("toneVars sets both variables and lets an explicit style win", () => {
  expect(toneVars("teal", { color: "red" })).toEqual({
    "--ds-tone": "var(--sd-teal)",
    "--ds-tone-wash": "color-mix(in srgb, var(--sd-teal) 12%, transparent)",
    color: "red",
  });
});

test("no tone means no variables, and the caller's style passes through untouched", () => {
  const style = { marginTop: 12 };
  expect(toneVars(undefined, style)).toBe(style);
  expect(toneVars(undefined)).toBeUndefined();
});
