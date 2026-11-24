import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { DataTable } from "./DataTable";

const columns = [
  { header: "Feature", tone: "muted" as const },
  { header: "Vertical", tone: "amber" as const },
  { header: "Horizontal" },
];
const rows = [
  ["Cost", "Expensive at high tiers", "Commodity hardware"],
  ["Limit", "Hardware ceiling", "Unlimited"],
];

test("the caption names the table and headers are column headers", () => {
  render(<DataTable caption="Scaling" columns={columns} rows={rows} />);
  const table = screen.getByRole("table", { name: "Scaling" });
  const headers = within(table).getAllByRole("columnheader");
  expect(headers.map((th) => th.textContent)).toEqual(["Feature", "Vertical", "Horizontal"]);
  expect(headers.every((th) => th.getAttribute("scope") === "col")).toBe(true);
});

test("a column tone colours every cell in that column and only that column", () => {
  render(<DataTable columns={columns} rows={rows} />);
  const vertical = screen.getAllByRole("cell").filter((_, i) => i % 3 === 1);
  expect(vertical.map((td) => td.style.getPropertyValue("--ds-tone"))).toEqual(["var(--sd-amber)", "var(--sd-amber)"]);
  expect(screen.getByText("Unlimited").getAttribute("style")).toBeNull();
});

test("a row longer than the columns still renders its extra cells", () => {
  render(<DataTable columns={[{ header: "A" }]} rows={[["a", "overflow"]]} />);
  expect(document.body.contains(screen.getByText("overflow"))).toBe(true);
});
