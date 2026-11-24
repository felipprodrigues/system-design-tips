import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Chip, ChipGroup } from "./Chip";

test("a chip never submits a surrounding form", () => {
  const submit = vi.fn((event: Event) => event.preventDefault());
  render(
    <form onSubmit={(event) => submit(event.nativeEvent)}>
      <Chip>Caching</Chip>
    </form>,
  );
  screen.getByRole("button", { name: "Caching" }).click();
  expect(submit).not.toHaveBeenCalled();
});

test("only a chip given `pressed` is a toggle button", () => {
  render(
    <ChipGroup label="Filters">
      <Chip>Plain</Chip>
      <Chip pressed={false}>Off</Chip>
      <Chip pressed>On</Chip>
    </ChipGroup>,
  );
  expect(screen.getByRole("button", { name: "Plain" }).hasAttribute("aria-pressed")).toBe(false);
  expect(screen.getByRole("button", { name: "Off" }).getAttribute("aria-pressed")).toBe("false");
  expect(screen.getByRole("button", { name: "On" }).getAttribute("aria-pressed")).toBe("true");
});

test("a count joins the accessible name, so 'Caching 6' is announced", () => {
  render(<Chip count={6}>Caching</Chip>);
  expect(document.body.contains(screen.getByRole("button", { name: "Caching 6" }))).toBe(true);
});

test("the group is labelled for assistive tech", () => {
  render(<ChipGroup label="Filter by theme" />);
  expect(document.body.contains(screen.getByRole("group", { name: "Filter by theme" }))).toBe(true);
});
