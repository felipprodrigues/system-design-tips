import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { DefinitionList } from "./DefinitionList";

test("terms and definitions pair up as a description list", () => {
  render(
    <DefinitionList
      items={[
        { title: "Elasticity", def: "Capacity that follows demand." },
        { title: "Statelessness", def: "No memory between requests." },
      ]}
    />,
  );
  expect(screen.getAllByRole("term").map((dt) => dt.textContent)).toEqual(["Elasticity", "Statelessness"]);
  expect(screen.getByText("No memory between requests.").classList.contains("sd-text-sm-tight")).toBe(true);
});

test("each pair sits in the legacy sd-card inside an sd-stack", () => {
  const { container } = render(<DefinitionList items={[{ title: "T", def: "D" }]} />);
  const list = container.querySelector("dl");
  expect(list?.classList.contains("sd-stack")).toBe(true);
  expect(list?.firstElementChild?.classList.contains("sd-card")).toBe(true);
});
