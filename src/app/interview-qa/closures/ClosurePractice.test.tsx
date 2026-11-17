import { afterEach, expect, test } from "vitest";
import { act } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import ClosurePractice from "./ClosurePractice";
import { EXERCISE } from "./exercise";

afterEach(cleanup);

function placeInOrder(values: string[]) {
  for (const value of values) {
    const tile = screen
      .getAllByRole("button", { name: `Place ${value} in the next slot` })
      .find((button) => !(button as HTMLButtonElement).disabled)!;
    act(() => tile.click());
  }
  act(() => screen.getByRole("button", { name: "Check answer" }).click());
}

test("the answer, repeats and all, marks every slot right", () => {
  render(<ClosurePractice exercise={EXERCISE} />);
  placeInOrder(EXERCISE.answer);
  screen.getByText(new RegExp(`All ${EXERCISE.answer.length} right`));
});

test("a wrong value is counted", () => {
  render(<ClosurePractice exercise={EXERCISE} />);
  placeInOrder(["10", ...EXERCISE.answer.slice(1)]);
  expect(screen.queryByText(/All \d+ right/)).toBeNull();
  screen.getByText(`${EXERCISE.answer.length - 1} of ${EXERCISE.answer.length}`);
});
