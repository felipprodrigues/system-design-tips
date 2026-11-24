import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Callout, PanelNote } from "./Callout";

test("the three legacy tones render exactly the legacy markup", () => {
  expect(renderToStaticMarkup(<Callout>x</Callout>)).toBe('<div class="sd-callout">x</div>');
  expect(renderToStaticMarkup(<Callout tone="accent">x</Callout>)).toBe('<div class="sd-callout sd-callout-accent">x</div>');
  expect(renderToStaticMarkup(<Callout tone="green">x</Callout>)).toBe('<div class="sd-callout sd-callout-green">x</div>');
});

test("any other tone keeps the callout shape and tints from its token", () => {
  render(<Callout tone="danger">Mistake</Callout>);
  const callout = screen.getByText("Mistake");
  expect(callout.classList.contains("sd-callout")).toBe(true);
  expect(callout.dataset.tone).toBe("danger");
  expect(callout.style.getPropertyValue("--ds-tone")).toBe("var(--sd-danger)");
});

test("an accent panel note is the legacy sd-panel-note", () => {
  expect(renderToStaticMarkup(<PanelNote>x</PanelNote>)).toBe('<div class="sd-panel-note">x</div>');
});

test("a toned panel note replaces the inline rgba() background", () => {
  render(<PanelNote tone="green">Optimize first</PanelNote>);
  expect(screen.getByText("Optimize first").style.getPropertyValue("--ds-tone")).toBe("var(--sd-green)");
});
