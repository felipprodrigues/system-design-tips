import { afterEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EXERCISE, EXTRA } from "../set/exercise";
import PracticeTabs from "./PracticeTabs";

afterEach(cleanup);

const shows = (line: string) => screen.queryAllByText(line, { exact: false }).length > 0;

test("one puzzle at a time; click and arrow keys switch, wrapping at the ends", () => {
  render(<PracticeTabs exercises={[EXERCISE, EXTRA]} />);
  const [first, second] = screen.getAllByRole("tab");

  expect(first.getAttribute("aria-selected")).toBe("true");
  expect(shows("const ids = new Set")).toBe(true);
  expect(shows("const order = new Set")).toBe(false);

  fireEvent.click(second);
  expect(second.getAttribute("aria-selected")).toBe("true");
  expect(shows("const order = new Set")).toBe(true);
  expect(shows("const ids = new Set")).toBe(false);

  fireEvent.keyDown(second, { key: "ArrowRight" });
  expect(first.getAttribute("aria-selected")).toBe("true");
  expect(document.activeElement).toBe(first);
});
