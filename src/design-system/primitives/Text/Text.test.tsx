import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Highlight, Strong, Text } from "./Text";

test("text variants render the legacy classes", () => {
  expect(renderToStaticMarkup(<Text variant="lede">x</Text>)).toBe('<p class="sd-lede">x</p>');
  expect(renderToStaticMarkup(<Text>x</Text>)).toBe('<p class="sd-text-sm">x</p>');
  expect(renderToStaticMarkup(<Text variant="sm-tight">x</Text>)).toBe('<p class="sd-text-sm-tight">x</p>');
  expect(renderToStaticMarkup(<Text variant="xs" as="span">x</Text>)).toBe('<span class="sd-text-xs">x</span>');
});

test("Strong is the sd-strong emphasis that hl() produces", () => {
  expect(renderToStaticMarkup(<Strong>x</Strong>)).toBe('<strong class="sd-strong">x</strong>');
});

test("highlight tones map to the four sd-hl classes", () => {
  expect(renderToStaticMarkup(<Highlight>x</Highlight>)).toBe('<span class="sd-hl">x</span>');
  expect(renderToStaticMarkup(<Highlight tone="accent">x</Highlight>)).toBe('<span class="sd-hl-accent">x</span>');
  expect(renderToStaticMarkup(<Highlight tone="amber" as="strong">x</Highlight>)).toBe(
    '<strong class="sd-hl-amber">x</strong>',
  );
  expect(renderToStaticMarkup(<Highlight tone="muted">x</Highlight>)).toBe('<span class="sd-hl-muted">x</span>');
});
