import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { Versus } from "./Versus";

test("left, divider and right render in order", () => {
  const { container } = render(<Versus left={<div>REST</div>} right={<div>GraphQL</div>} />);
  expect([...(container.firstElementChild?.children ?? [])].map((child) => child.textContent)).toEqual([
    "REST",
    "VS",
    "GraphQL",
  ]);
});
