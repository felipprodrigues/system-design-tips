import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { NumberBadge } from "./NumberBadge";

test("a tone replaces the hardcoded rgba() pair with token variables", () => {
  render(<NumberBadge tone="teal">2</NumberBadge>);
  const badge = screen.getByText("2");
  expect(badge.style.getPropertyValue("--ds-tone")).toBe("var(--sd-teal)");
  expect(badge.dataset.tone).toBe("teal");
});
