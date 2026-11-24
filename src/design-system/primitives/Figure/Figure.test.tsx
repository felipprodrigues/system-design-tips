import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Figure } from "./Figure";

test("a caption is the figure's first-child figcaption, which is what names it", () => {
  render(<Figure caption="Request path">diagram</Figure>);
  const figure = screen.getByRole("figure");
  const caption = figure.firstElementChild;
  expect(figure.classList.contains("sd-figure")).toBe(true);
  expect(caption?.tagName).toBe("FIGCAPTION");
  expect(caption?.classList.contains("sd-figure-caption")).toBe(true);
  expect(caption?.textContent).toBe("Request path");
});

test("no caption renders no empty figcaption", () => {
  render(<Figure>diagram</Figure>);
  expect(screen.getByRole("figure").querySelector("figcaption")).toBeNull();
});
