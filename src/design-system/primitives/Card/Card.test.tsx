import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Card } from "./Card";

test("a bare card is the legacy sd-card", () => {
  expect(renderToStaticMarkup(<Card>x</Card>)).toBe('<div class="sd-card">x</div>');
});

test("a panel card title uses the legacy panel title class", () => {
  expect(renderToStaticMarkup(<Card variant="panel" title="T">x</Card>)).toBe(
    '<div class="sd-panel-card"><div class="sd-panel-card-title">T</div>x</div>',
  );
});

test("a toned panel title keeps its legacy class and takes the tone", () => {
  render(<Card variant="panel" tone="accent" title="Toned">x</Card>);
  const title = screen.getByText("Toned");
  expect(title.classList.contains("sd-panel-card-title")).toBe(true);
  expect(title.parentElement?.style.getPropertyValue("--ds-tone")).toBe("var(--sd-accent)");
});
