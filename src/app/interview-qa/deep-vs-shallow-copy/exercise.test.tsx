import { afterEach, expect, test } from "vitest";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ClosurePractice from "../closures/ClosurePractice";
import { EXERCISE } from "./exercise";

afterEach(cleanup);

test("hovering a #N ref in the note highlights that box, and only that box", () => {
  const { container } = render(<ClosurePractice exercise={EXERCISE} />);
  const spoiler = screen.getByText(/Show the walkthrough/).closest("details")!;
  spoiler.open = true;
  fireEvent(spoiler, new Event("toggle"));
  for (let i = 0; i < 2; i++) act(() => screen.getByRole("button", { name: "Next →" }).click());

  screen.getByText("const alias = original", { selector: "code" });
  const ref = screen.getByRole("button", { name: "#1" });
  const box = container.querySelector('[data-box="#1 object"]')!;
  const other = container.querySelector('[data-box="#2 array"]')!;

  fireEvent.mouseEnter(ref);
  expect(box.className).toMatch(/hot/);
  expect(other.className).not.toMatch(/hot/);

  fireEvent.mouseLeave(ref);
  expect(box.className).not.toMatch(/hot/);
});
