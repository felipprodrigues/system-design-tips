import { createRef } from "react";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Section } from "./Section";

test("eyebrow and title render the legacy classes in the legacy order", () => {
  expect(renderToStaticMarkup(<Section eyebrow="Why This Exists" title="Why">body</Section>)).toBe(
    '<section class="sd-section"><p class="sd-eyebrow">Why This Exists</p><h2 class="sd-h2">Why</h2>body</section>',
  );
});

test("a Big Idea section has an eyebrow and no heading", () => {
  expect(renderToStaticMarkup(<Section eyebrow="Big Idea">body</Section>)).toBe(
    '<section class="sd-section"><p class="sd-eyebrow">Big Idea</p>body</section>',
  );
});

test("an id passes through, so in-page anchors keep working", () => {
  expect(renderToStaticMarkup(<Section id="offset" title="T" titleAs="h3" />)).toBe(
    '<section class="sd-section" id="offset"><h3 class="sd-h2">T</h3></section>',
  );
});

test("a ref reaches the rendered section, so callers can scroll it into view", () => {
  const ref = createRef<HTMLElement>();
  render(<Section ref={ref} eyebrow="Walk It" title="Nine Stages" />);
  expect(ref.current?.tagName).toBe("SECTION");
  expect(ref.current?.classList.contains("sd-section")).toBe(true);
});

test("a callback ref is called with the element and with null on unmount", () => {
  const calls: (HTMLElement | null)[] = [];
  const { unmount } = render(<Section ref={(node) => { calls.push(node); }} />);
  unmount();
  expect(calls.map((node) => node?.tagName ?? null)).toEqual(["SECTION", null]);
});
