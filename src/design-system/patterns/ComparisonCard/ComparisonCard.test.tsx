import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ComparisonCard } from "./ComparisonCard";

test("points render as a list in the card's tone, and a footer only when given", () => {
  const { container, rerender } = render(<ComparisonCard label="REST" tone="amber" points={["One", "Two"]} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByRole("list").style.getPropertyValue("--ds-tone")).toBe("var(--sd-amber)");
  expect(container.firstElementChild?.children).toHaveLength(2);

  rerender(<ComparisonCard label="REST" points={["One"]} footer="Example" />);
  expect(container.firstElementChild?.children).toHaveLength(3);
});
