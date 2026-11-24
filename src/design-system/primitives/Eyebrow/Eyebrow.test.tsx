import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Eyebrow } from "./Eyebrow";

test("each variant renders the legacy markup it replaces", () => {
  expect(renderToStaticMarkup(<Eyebrow>Big Idea</Eyebrow>)).toBe('<p class="sd-eyebrow">Big Idea</p>');
  expect(renderToStaticMarkup(<Eyebrow variant="accent">Quiz Review</Eyebrow>)).toBe(
    '<p class="sd-eyebrow-accent">Quiz Review</p>',
  );
  expect(renderToStaticMarkup(<Eyebrow variant="sub">Asking</Eyebrow>)).toBe('<p class="sd-eyebrow-sub">Asking</p>');
});

test("a tone colours the label the way the inline style did", () => {
  expect(renderToStaticMarkup(<Eyebrow variant="sub" tone="amber">x</Eyebrow>)).toBe(
    '<p class="sd-eyebrow-sub" style="color:var(--sd-amber)">x</p>',
  );
});
