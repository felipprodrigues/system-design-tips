import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ProgressBar } from "./ProgressBar";

test("without a label the bar is decoration, hidden from assistive tech", () => {
  const { container } = render(<ProgressBar value={40} />);
  expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  expect(screen.queryByRole("progressbar")).toBeNull();
});

test("with a label it is a progressbar reporting its value", () => {
  render(<ProgressBar value={42.4} label="Section progress" />);
  const bar = screen.getByRole("progressbar", { name: "Section progress" });
  expect(bar.getAttribute("aria-valuenow")).toBe("42");
  expect(bar.getAttribute("aria-valuemax")).toBe("100");
});

test("out-of-range values are clamped rather than overflowing the track", () => {
  const { container } = render(
    <>
      <ProgressBar value={-10} />
      <ProgressBar value={180} />
    </>,
  );
  const fills = [...container.querySelectorAll("span > span")] as HTMLElement[];
  expect(fills.map((fill) => fill.style.width)).toEqual(["0%", "100%"]);
});
