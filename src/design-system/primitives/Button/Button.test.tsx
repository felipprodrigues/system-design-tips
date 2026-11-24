import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Button, buttonStyles } from "./Button";

test("defaults to type=button so it cannot submit a form by accident", () => {
  render(<Button>Go</Button>);
  expect(screen.getByRole("button", { name: "Go" }).getAttribute("type")).toBe("button");
});

test("a submit button stays possible when asked for", () => {
  render(<Button type="submit">Send</Button>);
  expect(screen.getByRole("button", { name: "Send" }).getAttribute("type")).toBe("submit");
});

test("buttonStyles gives a link exactly what Button gives a button", () => {
  render(
    <>
      <Button variant="pill" tone="teal">
        A
      </Button>
      <a href="/x" {...buttonStyles({ variant: "pill", tone: "teal" })}>
        B
      </a>
    </>,
  );
  const button = screen.getByRole("button", { name: "A" });
  const link = screen.getByRole("link", { name: "B" });
  expect(link.className).toBe(button.className);
  expect(link.getAttribute("style")).toBe(button.getAttribute("style"));
  expect(link.dataset.variant).toBe("pill");
});

test("ghost is the default variant", () => {
  expect(buttonStyles()["data-variant"]).toBe("ghost");
});
