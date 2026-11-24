import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Heading } from "./Heading";

test("levels map to the legacy classes and their natural elements", () => {
  expect(renderToStaticMarkup(<Heading level="page">T</Heading>)).toBe('<h1 class="sd-h1">T</h1>');
  expect(renderToStaticMarkup(<Heading>T</Heading>)).toBe('<h2 class="sd-h2">T</h2>');
});

test("the element can change without changing the look", () => {
  expect(renderToStaticMarkup(<Heading as="h3">T</Heading>)).toBe('<h3 class="sd-h2">T</h3>');
});
