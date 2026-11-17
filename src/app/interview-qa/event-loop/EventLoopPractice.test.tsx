import { afterEach, expect, test } from "vitest";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import EventLoopPractice from "./EventLoopPractice";
import { EXERCISES } from "./exercises";

const [first] = EXERCISES;

// No globals in vitest.config, so auto-cleanup is not wired: two renders would
// otherwise leave two boards in the document and every query find both.
afterEach(cleanup);

function click(name: RegExp | string) {
  act(() => screen.getByRole("button", { name }).click());
}

test("placing the answer in order marks it all right", () => {
  render(<EventLoopPractice exercises={EXERCISES} />);

  for (const token of first.answer) click(`Place ${token} next`);
  click("Check answer");

  screen.getByText(new RegExp(`All ${first.answer.length} right`));
});

test("a wrong placement is counted, and clearing a slot un-checks", () => {
  render(<EventLoopPractice exercises={EXERCISES} />);

  for (const token of [...first.answer].reverse()) click(`Place ${token} next`);
  click("Check answer");

  expect(screen.queryByText(new RegExp(`All ${first.answer.length} right`))).toBeNull();
  screen.getByText(/in the right place/);
});

test("the walkthrough steps through to the answer", () => {
  render(<EventLoopPractice exercises={EXERCISES} />);
  const spoiler = screen.getByText(/Show the walkthrough/).closest("details")!;

  // What a summary click does, in two steps: jsdom queues the toggle event as a
  // task of its own, so clicking here would assert before the state caught up.
  spoiler.open = true;
  fireEvent(spoiler, new Event("toggle"));
  screen.getByText(`Step 0 of ${first.steps.length - 1}`);

  for (let i = 0; i < first.steps.length - 1; i++) click(/Next/);
  screen.getByText(`Step ${first.steps.length - 1} of ${first.steps.length - 1}`);
  screen.getByText(first.steps.at(-1)!.note);
});
