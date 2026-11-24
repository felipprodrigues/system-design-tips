import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Prose } from "./Prose";

test("prose keeps the legacy class at both sizes", () => {
  render(
    <>
      <Prose data-testid="md">x</Prose>
      <Prose data-testid="lg" size="lg">y</Prose>
    </>,
  );
  expect(screen.getByTestId("md").classList.contains("sd-prose")).toBe(true);
  expect(screen.getByTestId("lg").classList.contains("sd-prose")).toBe(true);
  expect(screen.getByTestId("lg").className).not.toBe(screen.getByTestId("md").className);
});
