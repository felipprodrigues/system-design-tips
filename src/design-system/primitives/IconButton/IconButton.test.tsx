import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { IconButton } from "./IconButton";

test("the label is the accessible name, not the glyph", () => {
  render(<IconButton label="Close">✕</IconButton>);
  expect(screen.getByRole("button", { name: "Close" }).getAttribute("type")).toBe("button");
});
