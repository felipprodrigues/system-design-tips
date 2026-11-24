import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Badge } from "./Badge";

test("variant and tone are exposed on the element", () => {
  render(
    <Badge variant="pill" tone="done">
      Completed
    </Badge>,
  );
  const badge = screen.getByText("Completed");
  expect(badge.dataset.variant).toBe("pill");
  expect(badge.style.getPropertyValue("--ds-tone-wash")).toBe("var(--sd-done-wash)");
});

test("the default is an untoned tag, which falls back to accent in CSS", () => {
  render(<Badge>Vertical</Badge>);
  const badge = screen.getByText("Vertical");
  expect(badge.dataset.variant).toBe("tag");
  expect(badge.getAttribute("style")).toBeNull();
});
