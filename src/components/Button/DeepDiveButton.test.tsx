import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DeepDiveButton from "./DeepDiveButton";

test("renders the default label", () => {
  render(<DeepDiveButton onClick={() => {}} />);
  screen.getByRole("button", { name: /deep dive/i });
});

test("fires onClick", () => {
  const onClick = vi.fn();
  render(<DeepDiveButton onClick={onClick} label="Go" />);
  screen.getByRole("button", { name: /go/i }).click();
  expect(onClick).toHaveBeenCalledOnce();
});
